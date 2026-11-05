import { type Request, type Response } from 'express'
import { logger } from '../config/logger'
import { createBooking, handleMidtransCallback, getMidtransLogs, getPaymentStatus } from '../services/booking.service'
import { sendBadRequest, sendError, sendSuccess } from '../utils/response.helper'
import utils from '../utils/utils'
import { createBookingValidation } from '../validations/booking.validation'

export const createBookingHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.locals.sub
    const { data: encryptedPayload } = req.body

    if (!encryptedPayload) {
      return void sendBadRequest(res, 'Payload diperlukan')
    }

    let decoded: string
    try {
      decoded = utils.decryptWithSecret(encryptedPayload)
    } catch {
      return void sendBadRequest(res, 'Payload tidak valid')
    }

    let payload: any
    try {
      payload = JSON.parse(decoded)
    } catch {
      return void sendBadRequest(res, 'Payload tidak valid')
    }

    const { error } = createBookingValidation(payload)
    if (error) {
      return void sendBadRequest(res, error.details[0].message)
    }

    const result = await createBooking(userId, payload)

    const encryptedResponse = utils.encryptWithSecret(JSON.stringify({ id: result.booking_id }))

    sendSuccess(res, { encrypted_id: encryptedResponse }, 'Booking berhasil dibuat', 201)
  } catch (error: any) {
    logger.error('ERR: booking - createBookingHandler = ', error)
    sendError(res, error.message || 'Terjadi kesalahan server', 500)
  }
}

export const midtransNotificationHandler = async (req: Request, res: Response) => {
  try {
    await handleMidtransCallback(req.body)
    res.status(200).json({ status: 'ok' })
  } catch (error) {
    logger.error('ERR: booking - midtransNotification = ', error)
    res.status(500).json({ status: 'error' })
  }
}

export const getMidtransLogsHandler = async (req: Request, res: Response) => {
  try {
    const { search, status, page, limit } = req.query

    const parsedPage = page ? Number(page) : undefined
    const parsedLimit = limit ? Number(limit) : undefined

    if (parsedPage !== undefined && (isNaN(parsedPage) || parsedPage < 1)) {
      return void sendBadRequest(res, "Parameter 'page' harus berupa angka positif")
    }
    if (parsedLimit !== undefined && (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100)) {
      return void sendBadRequest(res, "Parameter 'limit' harus antara 1 dan 100")
    }

    const result = await getMidtransLogs({
      search: search as string,
      status: status as string,
      page: parsedPage,
      limit: parsedLimit
    })

    sendSuccess(res, result.data, 'Berhasil mengambil data midtrans logs', 200, result.meta)
  } catch (error) {
    logger.error('ERR: booking - getMidtransLogsHandler = ', error)
    sendError(res, 'Terjadi kesalahan server', 500)
  }
}

export const getPaymentStatusHandler = async (req: Request, res: Response) => {
  try {
    const { data: encryptedId } = req.body

    if (!encryptedId) {
      return void sendBadRequest(res, 'ID booking diperlukan')
    }

    const result = await getPaymentStatus(encryptedId)

    sendSuccess(res, result, 'success')
  } catch (error: any) {
    logger.error('ERR: booking - getPaymentStatusHandler = ', error)
    sendError(res, error.message || 'Terjadi kesalahan server', 500)
  }
}
