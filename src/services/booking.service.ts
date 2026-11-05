import prisma from '../config/prisma'
import { logger } from '../config/logger'
import utils from '../utils/utils'
import { createTransaction, getTransactionStatus, getQrCodeBase64 } from './midtrans.service'
import { sendBookingPaymentEmail, sendBookingInvoiceEmail, sendRefereeBookingEmail } from './email-template.service'
import { getActiveServiceFee } from './master.service'
import { type BookingPayload, type BookingResult } from '../types/booking.type'
import { PaginatedResult } from '../types/region.type'
import type { MidtransLogQueryParams } from '../types/booking.type'

export const createBooking = async (userId: string, payload: BookingPayload): Promise<BookingResult> => {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, phone: true }
  })

  if (!user) {
    throw new Error('User tidak ditemukan')
  }

  const sport = await prisma.md_sports.findFirst({
    where: { name: { equals: payload.sport, mode: 'insensitive' } }
  })

  if (!sport) {
    throw new Error('Cabang olahraga tidak ditemukan')
  }

  const bookingDate = new Date(payload.date)
  const startTime = new Date(`${payload.date}T${payload.start_time}:00`)
  const endTime = new Date(`${payload.date}T${payload.end_time}:00`)

  const mainReferee = payload.referees.find((r) => r.role_referee === 'MAIN_REFEREE')
  if (!mainReferee) {
    throw new Error('Wasit utama wajib dipilih')
  }

  const mainRefSport = await prisma.referee_sports.findFirst({
    where: {
      referee_id: mainReferee.referee_id,
      sport_id: sport.id
    }
  })

  if (!mainRefSport) {
    throw new Error('Wasit utama tidak tersedia untuk cabang olahraga ini')
  }

  const conflict = await prisma.bookings.findFirst({
    where: {
      date: bookingDate,
      OR: [
        { start_time: { lte: endTime }, end_time: { gte: startTime } }
      ],
      booking_details: {
        some: {
          referee_id: mainReferee.referee_id
        }
      }
    }
  })

  if (conflict) {
    throw new Error('Jadwal sudah dibooking')
  }

  let totalAmount = 0

  for (const referee of payload.referees) {
    const refSport = await prisma.referee_sports.findFirst({
      where: {
        referee_id: referee.referee_id,
        sport_id: sport.id
      },
      include: {
        referee_pricing: {
          where: { is_deleted: false, type_time: payload.type_time, type_game: payload.type_match }
        }
      }
    })

    const price = refSport?.referee_pricing[0]?.amount ?? 0
    totalAmount += price
  }

  let discount = 0
  if (payload.voucher_code) {
    const voucher = await prisma.md_voucher.findFirst({
      where: { name: payload.voucher_code, type: 'discount' }
    })
    if (voucher) {
      discount = voucher.amount
    }
  }

  const activeFee = await getActiveServiceFee('booking')
  const feePercentage = activeFee ? Number(activeFee.percentage) : 0
  const feeAmount = activeFee?.type === 'fixed' ? (activeFee.amount ?? 0) : 0
  const adminFee = activeFee?.type === 'fixed'
    ? feeAmount
    : Math.round(totalAmount * (feePercentage / 100))

  const grandTotal = totalAmount - discount + adminFee

  const bookId = `WST-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

  const result = await prisma.$transaction(async (tx) => {
    const booking = await tx.bookings.create({
      data: {
        user_id: userId,
        referee_sport_id: mainRefSport.id,
        book_id: bookId,
        date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        location: payload.location ?? '',
        address: payload.address ?? '',
        longitude: payload.longitude ?? 0,
        latitude: payload.latitude ?? 0,
        link_google_maps: payload.link_google_maps ?? '',
        notes: payload.notes ?? '',
        totals: totalAmount,
        type_match: payload.type_match,
        type_time: payload.type_time
      }
    })

    for (const referee of payload.referees) {
      await tx.booking_details.create({
        data: {
          booking_id: booking.id,
          referee_id: referee.referee_id,
          role_referee: referee.role_referee
        }
      })
    }

    const orderId = bookId
    const payment = await tx.payments.create({
      data: {
        booking_id: booking.id,
        total_amount: totalAmount,
        grand_total: grandTotal,
        discount,
        admin_fee: adminFee,
        payment_method: 'midtrans',
        status: 'PENDING',
        midtrans_order_id: orderId
      }
    })

    return { booking, payment, orderId }
  })

  let paymentUrl: string | undefined
  try {
    const midtransResponse = await createTransaction({
      order_id: result.orderId,
      gross_amount: result.payment.grand_total,
      customer_name: user.name ?? '',
      customer_email: user.email,
      customer_phone: user.phone ?? ''
    })

    const paymentData = midtransResponse as any
    if (paymentData?.transaction_status === 'pending') {
      const qrAction = paymentData?.actions?.find((a: any) => a.name === 'generate-qr-code')
      paymentUrl = qrAction?.url ?? ''
    }
  } catch (err) {
    logger.error('ERR: createBooking - midtrans = ', err)
  }

  if (user.email) {
    try {
      sendBookingPaymentEmail(user.name ?? '', user.email, bookId, result.payment.grand_total, paymentUrl ?? '')
    } catch (err) {
      logger.error('ERR: createBooking - email = ', err)
    }
  }

  try {
    const refereeIds = payload.referees.map((r) => r.referee_id)
    const referees = await prisma.referees.findMany({
      where: { id: { in: refereeIds } },
      include: {
        users: { select: { name: true, email: true } }
      }
    })

    const scheduleStart = startTime
    const sportName = sport.name
    const location = payload.location ?? payload.address ?? ''

    for (const ref of referees) {
      if (ref.users?.email) {
        try {
          await sendRefereeBookingEmail(
            ref.users.name ?? 'Wasit',
            ref.users.email,
            bookId,
            sportName,
            bookingDate,
            scheduleStart,
            location
          )
        } catch (err) {
          logger.error(`ERR: createBooking - referee email ${ref.users.email} = `, err)
        }
      }
    }
  } catch (err) {
    logger.error('ERR: createBooking - referee emails = ', err)
  }

  const encryptedId = utils.encryptWithSecret(result.booking.id)

  return {
    booking_id: result.booking.id,
    encrypted_id: encryptedId,
    payment: {
      id: result.payment.id,
      total_amount: result.payment.total_amount,
      grand_total: result.payment.grand_total,
      discount: result.payment.discount,
      admin_fee: result.payment.admin_fee,
      status: result.payment.status,
      payment_url: paymentUrl
    }
  }
}

export const handleMidtransCallback = async (payload: any) => {
  const orderId = payload.order_id ?? ''
  const transactionStatus = payload.transaction_status ?? ''
  const transactionId = payload.transaction_id ?? ''

  await prisma.midtrans_logs.create({
    data: {
      order_id: orderId,
      payload,
      status: transactionStatus
    }
  })

  const payment = await prisma.payments.findFirst({
    where: { midtrans_order_id: orderId },
    include: {
      bookings: {
        include: {
          users: { select: { name: true, email: true } }
        }
      }
    }
  })

  if (!payment) {
    logger.error('ERR: midtrans callback - payment not found for order: ' + orderId)
    return
  }

  let newStatus = payment.status
  if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
    newStatus = 'SUCCESS'
  } else if (transactionStatus === 'pending') {
    newStatus = 'PENDING'
  } else if (transactionStatus === 'deny' || transactionStatus === 'expire' || transactionStatus === 'cancel') {
    newStatus = 'FAILED'
  }

  await prisma.payments.update({
    where: { id: payment.id },
    data: {
      status: newStatus,
      midtrans_transaction_id: transactionId,
      updated_at: new Date()
    }
  })

  if (newStatus === 'SUCCESS' && payment.bookings?.users?.email) {
    try {
      await sendBookingInvoiceEmail(
        payment.bookings.users.name ?? '',
        payment.bookings.users.email,
        payment.bookings.book_id,
        payment.grand_total
      )
    } catch (err) {
      logger.error('ERR: midtrans callback - invoice email = ', err)
    }
  }
}

export const getPaymentStatus = async (encryptedId: string) => {
  let decoded: string
  try {
    decoded = utils.decryptWithSecret(encryptedId)
  } catch {
    throw new Error('ID booking tidak valid')
  }

  let parsed: any
  try {
    parsed = JSON.parse(decoded)
  } catch {
    throw new Error('ID booking tidak valid')
  }

  const bookingId = parsed?.id
  if (!bookingId) {
    throw new Error('ID booking tidak ditemukan')
  }

  const booking = await prisma.bookings.findUnique({
    where: { id: bookingId },
    include: {
      payments: {
        orderBy: { created_at: 'desc' },
        take: 1
      }
    }
  })

  if (!booking) {
    throw new Error('Booking tidak ditemukan')
  }

  const payment = booking.payments[0]
  if (!payment) {
    throw new Error('Pembayaran tidak ditemukan')
  }

  let paymentUrl: string | null = null
  let qrImage: string | null = null

  if (payment.midtrans_order_id && payment.status === 'PENDING') {
    try {
      const midtransData = await getTransactionStatus(payment.midtrans_order_id)
      const transactionStatus = midtransData?.transaction_status ?? ''

      await prisma.midtrans_logs.create({
        data: {
          order_id: payment.midtrans_order_id,
          payload: midtransData,
          status: transactionStatus
        }
      })

      let newStatus = payment.status
      if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
        newStatus = 'SUCCESS'
      } else if (transactionStatus === 'deny' || transactionStatus === 'expire' || transactionStatus === 'cancel') {
        newStatus = 'FAILED'
      }

      if (newStatus !== payment.status) {
        await prisma.payments.update({
          where: { id: payment.id },
          data: {
            status: newStatus,
            midtrans_transaction_id: midtransData?.transaction_id ?? '',
            updated_at: new Date()
          }
        })

        payment.status = newStatus
        payment.midtrans_transaction_id = midtransData?.transaction_id ?? ''
      }

      if (newStatus === 'PENDING') {
        const qrAction = midtransData?.actions?.find((a: any) => a.name === 'generate-qr-code')
        paymentUrl = qrAction?.url ?? null
        if (qrAction?.url) {
          try {
            qrImage = await getQrCodeBase64(qrAction.url)
          } catch (qrErr) {
            logger.error('ERR: getPaymentStatus - QR fetch = ', qrErr)
          }
        }
      }
    } catch (err) {
      logger.error('ERR: getPaymentStatus - midtrans = ', err)
    }
  }

  return {
    booking_id: booking.id,
    book_id: booking.book_id,
    payment: {
      id: payment.id,
      total_amount: payment.total_amount,
      grand_total: payment.grand_total,
      discount: payment.discount,
      admin_fee: payment.admin_fee,
      status: payment.status,
      payment_url: paymentUrl,
      qr_image: qrImage
    }
  }
}

export const getMidtransLogs = async (params: MidtransLogQueryParams = {}): Promise<PaginatedResult<any>> => {
  const { search, status, page = 1, limit = 10 } = params
  const skip = (page - 1) * limit

  const where: Record<string, any> = {}

  if (search) {
    where.order_id = { contains: search, mode: 'insensitive' }
  }

  if (status) {
    where.status = status
  }

  const [total, data] = await Promise.all([
    prisma.midtrans_logs.count({ where }),
    prisma.midtrans_logs.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: limit
    })
  ])

  const totalPages = Math.ceil(total / limit)

  return {
    data,
    meta: {
      total,
      page,
      limit,
      total_pages: totalPages,
      has_next: page < totalPages,
      has_prev: page > 1
    }
  }
}

export const syncPendingPayments = async () => {
  try {
    const pendingPayments = await prisma.payments.findMany({
      where: {
        status: 'PENDING',
        midtrans_order_id: { not: null }
      },
      include: {
        bookings: {
          include: {
            users: { select: { name: true, email: true } }
          }
        }
      }
    })

    for (const payment of pendingPayments) {
      if (!payment.midtrans_order_id) continue

      try {
        const midtransData = await getTransactionStatus(payment.midtrans_order_id)
        const transactionStatus = midtransData?.transaction_status ?? ''

        await prisma.midtrans_logs.create({
          data: {
            order_id: payment.midtrans_order_id,
            payload: midtransData,
            status: transactionStatus
          }
        })

        let newStatus = payment.status
        if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
          newStatus = 'SUCCESS'
        } else if (transactionStatus === 'deny' || transactionStatus === 'expire' || transactionStatus === 'cancel') {
          newStatus = 'FAILED'
        } else {
          continue
        }

        await prisma.payments.update({
          where: { id: payment.id },
          data: {
            status: newStatus,
            midtrans_transaction_id: midtransData?.transaction_id ?? '',
            updated_at: new Date()
          }
        })

        if (newStatus === 'SUCCESS' && payment.bookings?.users?.email) {
          try {
            await sendBookingInvoiceEmail(
              payment.bookings.users.name ?? '',
              payment.bookings.users.email,
              payment.bookings.book_id,
              payment.grand_total
            )
          } catch (err) {
            logger.error('ERR: syncPendingPayments - invoice email = ', err)
          }
        }
      } catch (err) {
        logger.error(`ERR: syncPendingPayments - order ${payment.midtrans_order_id} = `, err)
      }
    }
  } catch (error) {
    logger.error('ERR: syncPendingPayments = ', error)
  }
}
