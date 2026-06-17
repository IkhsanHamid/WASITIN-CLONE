import prisma from '../config/prisma'
import { logger } from '../config/logger'
import utils from '../utils/utils'
import { hashing } from '../config/hashing'
import { sendRefereeVerifiedEmail, sendRefereeRejectedEmail } from './email-template.service'
import { addHours, parse, format, isWithinInterval, startOfDay, endOfDay, isSameDay } from 'date-fns'

export const getAllReferees = async () => {
  try {
    const referees = await prisma.referees.findMany({
      where: {
        users: { is_deleted: false }
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            photo: true,
            province: true,
            city: true,
            is_active: true
          }
        },
        licenses: {
          where: { is_deleted: false },
          select: {
            id: true,
            name: true,
            license_level: true,
            organization: true,
            no_license: true,
            expired_date: true,
            date_of_issue: true,
            file_link: true,
            is_verified: true
          }
        },
        referee_sports: {
          include: {
            md_sports: {
              select: { id: true, name: true }
            }
          }
        },
        ratings: {
          select: {
            rating: true
          }
        }
      },
      orderBy: { users: { name: 'asc' } }
    })

    const result = referees.map((ref) => {
      const avgRating =
        ref.ratings.length > 0 ? ref.ratings.reduce((sum, r) => sum + Number(r.rating), 0) / ref.ratings.length : null

      return {
        id: ref.id,
        user_id: ref.user_id,
        bio: ref.bio,
        verification:
          !ref.is_verification && ref.recheck_data
            ? `Ditolak`
            : ref.is_verification
              ? 'Terverifikasi'
              : 'Menunggu Verifikasi',
        photos: ref.photos,
        user: ref.users,
        licenses: ref.licenses,
        sports: ref.referee_sports.map((rs) => rs.md_sports),
        average_rating: avgRating ? Math.round(avgRating * 100) / 100 : 0
      }
    })

    return utils.resSuccess(200, 'success', result)
  } catch (error) {
    logger.error('ERR: referee - getAllReferees = ', error)
    const formattedError = utils.formatUnexpectedError(error)
    throw formattedError
  }
}

export const getRefereeById = async (id: string) => {
  try {
    const referee = await prisma.referees.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            photo: true,
            province: true,
            city: true,
            is_active: true
          }
        },
        licenses: {
          where: { is_deleted: false },
          select: {
            id: true,
            name: true,
            license_level: true,
            organization: true,
            no_license: true,
            expired_date: true,
            date_of_issue: true,
            file_link: true,
            is_verified: true
          }
        },
        referee_sports: {
          include: {
            md_sports: {
              select: { id: true, name: true }
            },
            referee_pricing: {
              where: { is_deleted: false },
              select: {
                id: true,
                amount: true,
                type_time: true,
                type_game: true
              }
            }
          }
        },
        referee_banks: {
          where: { is_deleted: false },
          select: {
            id: true,
            bank_code: true,
            number_account: true,
            name: true,
            is_verified: true,
            is_active: true
          }
        },
        ratings: {
          select: {
            rating: true,
            comments: true,
            photos: true,
            created_at: true
          }
        }
      }
    })

    if (!referee) {
      return utils.resErr(404, 'Referee tidak ditemukan', null)
    }

    const avgRating =
      referee.ratings.length > 0
        ? referee.ratings.reduce((sum, r) => sum + Number(r.rating), 0) / referee.ratings.length
        : null

    const result = {
      id: referee.id,
      user_id: referee.user_id,
      bio: referee.bio,
      photo_profile: referee.photo_profile,
      is_verification: referee.is_verification,
      photos: referee.photos,
      user: referee.users,
      licenses: referee.licenses,
      sports: referee.referee_sports.map((rs) => ({
        ...rs.md_sports,
        pricing: rs.referee_pricing
      })),
      banks: referee.referee_banks,
      ratings: referee.ratings,
      average_rating: avgRating ? Math.round(avgRating * 100) / 100 : 0
    }

    return utils.resSuccess(200, 'success', result)
  } catch (error) {
    logger.error('ERR: referee - getRefereeById = ', error)
    const formattedError = utils.formatUnexpectedError(error)
    throw formattedError
  }
}

export const updateReferee = async (
  id: string,
  payload: { bio?: string; is_verification?: boolean; photos?: string[] }
) => {
  try {
    const existing = await prisma.referees.findUnique({ where: { id } })
    if (!existing) {
      return utils.resErr(404, 'Referee tidak ditemukan', null)
    }

    const referee = await prisma.referees.update({
      where: { id },
      data: {
        bio: payload.bio ?? existing.bio,
        is_verification: payload.is_verification ?? existing.is_verification,
        photos: payload.photos ?? existing.photos
      }
    })

    return utils.resSuccess(200, 'Berhasil update referee', referee)
  } catch (error) {
    logger.error('ERR: referee - updateReferee = ', error)
    const formattedError = utils.formatUnexpectedError(error)
    throw formattedError
  }
}

export const deleteReferee = async (id: string) => {
  try {
    const referee = await prisma.referees.findUnique({
      where: { id },
      select: { id: true, user_id: true }
    })

    if (!referee) {
      return utils.resErr(404, 'Referee tidak ditemukan', null)
    }

    await prisma.$transaction(async (tx) => {
      await tx.users.update({
        where: { id: referee.user_id },
        data: { is_deleted: true }
      })
    })

    return utils.resSuccess(200, 'Berhasil menghapus referee', null)
  } catch (error) {
    logger.error('ERR: referee - deleteReferee = ', error)
    const formattedError = utils.formatUnexpectedError(error)
    throw formattedError
  }
}

export const verifyReferee = async (id: string, isVerified: boolean, reason?: string) => {
  try {
    const referee = await prisma.referees.findUnique({
      where: { id },
      include: { users: { select: { email: true, name: true } } }
    })

    if (!referee) {
      return utils.resErr(404, 'Referee tidak ditemukan', null)
    }

    if (isVerified) {
      const tempPassword = utils.generateRandomPassword(8)
      const hashedPassword = hashing(tempPassword)

      await prisma.$transaction(async (tx) => {
        await tx.referees.update({
          where: { id },
          data: { is_verification: true, verification_reason: null }
        })

        await tx.licenses.updateMany({
          where: { referee_id: id, is_deleted: false },
          data: { is_verified: true }
        })

        await tx.users.update({
          where: { id: referee.user_id },
          data: {
            password: hashedPassword,
            is_active: true
          }
        })
      })

      await sendRefereeVerifiedEmail(referee.users.name!, referee.users.email, tempPassword)

      return utils.resSuccess(200, 'Berhasil verifikasi referee', { id, email: referee.users.email })
    } else {
      if (!reason) {
        return utils.resErr(400, 'Alasan penolakan wajib diisi', null)
      }

      await prisma.$transaction(async (tx) => {
        await tx.referees.update({
          where: { id },
          data: { is_verification: false, verification_reason: reason, recheck_data: true }
        })

        await tx.licenses.updateMany({
          where: { referee_id: id, is_deleted: false },
          data: { is_verified: false }
        })
      })

      const encryptedId = utils.encryptWithSecret(id)
      await sendRefereeRejectedEmail(referee.users.name!, referee.users.email, reason, encryptedId)

      return utils.resSuccess(200, 'Referee ditolak', { id, reason })
    }
  } catch (error) {
    logger.error('ERR: referee - verifyReferee = ', error)
    const formattedError = utils.formatUnexpectedError(error)
    throw formattedError
  }
}

export const activateReferee = async (id: string) => {
  try {
    const referee = await prisma.referees.findUnique({
      where: { id },
      select: { id: true, user_id: true }
    })

    if (!referee) {
      return utils.resErr(404, 'Referee tidak ditemukan', null)
    }

    await prisma.users.update({
      where: { id: referee.user_id },
      data: { is_active: true }
    })

    return utils.resSuccess(200, 'Berhasil mengaktifkan referee', null)
  } catch (error) {
    logger.error('ERR: referee - activateReferee = ', error)
    const formattedError = utils.formatUnexpectedError(error)
    throw formattedError
  }
}

export const deactivateReferee = async (id: string) => {
  try {
    const referee = await prisma.referees.findUnique({
      where: { id },
      select: { id: true, user_id: true }
    })

    if (!referee) {
      return utils.resErr(404, 'Referee tidak ditemukan', null)
    }

    await prisma.users.update({
      where: { id: referee.user_id },
      data: { is_active: false }
    })

    return utils.resSuccess(200, 'Berhasil menonaktifkan referee', null)
  } catch (error) {
    logger.error('ERR: referee - deactivateReferee = ', error)
    const formattedError = utils.formatUnexpectedError(error)
    throw formattedError
  }
}

export const getRefereeProfile = async (userId: string) => {
  try {
    const referee = await prisma.referees.findFirst({
      where: { user_id: userId },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            photo: true,
            province: true,
            city: true,
            is_active: true
          }
        },
        licenses: {
          where: { is_deleted: false },
          select: {
            id: true,
            name: true,
            license_level: true,
            organization: true,
            no_license: true,
            expired_date: true,
            date_of_issue: true,
            file_link: true,
            is_verified: true
          }
        },
        referee_sports: {
          include: {
            md_sports: {
              select: { id: true, name: true }
            }
          }
        }
      }
    })

    if (!referee) {
      return utils.resErr(404, 'Profile referee tidak ditemukan', null)
    }

    const result = {
      id: referee.id,
      bio: referee.bio,
      photo_profile: referee.photo_profile,
      photos: referee.photos,
      user: referee.users,
      licenses: referee.licenses,
      sports: referee.referee_sports.map((rs) => ({
        sport_id: rs.md_sports.id,
        sport_name: rs.md_sports.name
      }))
    }

    return utils.resSuccess(200, 'success', result)
  } catch (error) {
    logger.error('ERR: referee - getRefereeProfile = ', error)
    const formattedError = utils.formatUnexpectedError(error)
    throw formattedError
  }
}

export const updateRefereeProfile = async (
  userId: string,
  payload: {
    name?: string
    phone?: string
    province?: string
    city?: string
    bio?: string
    photo_profile?: string
    photos?: string[]
    licenses?: Array<{
      id?: string
      name: string
      license_level: string
      organization: string
      no_license: string
      expired_date: Date
      date_of_issue: Date
      file_link?: string
    }>
    pricing?: Array<{
      id?: string
      sport_id: string
      amount: number
      type_time: string
      type_game: string
    }>
  }
) => {
  try {
    const referee = await prisma.referees.findFirst({
      where: { user_id: userId }
    })

    if (!referee) {
      return utils.resErr(404, 'Profile referee tidak ditemukan', null)
    }

    await prisma.$transaction(async (tx) => {
      const userData: Record<string, any> = {}
      if (payload.name !== undefined) userData.name = payload.name
      if (payload.phone !== undefined) userData.phone = payload.phone
      if (payload.province !== undefined) userData.province = payload.province
      if (payload.city !== undefined) userData.city = payload.city

      if (Object.keys(userData).length > 0) {
        await tx.users.update({
          where: { id: userId },
          data: userData
        })
      }

      const refereeData: Record<string, any> = {}
      if (payload.bio !== undefined) refereeData.bio = payload.bio
      if (payload.photo_profile !== undefined) refereeData.photo_profile = payload.photo_profile
      if (payload.photos !== undefined) refereeData.photos = payload.photos

      if (Object.keys(refereeData).length > 0) {
        await tx.referees.update({
          where: { id: referee.id },
          data: refereeData
        })
      }

      if (payload.licenses) {
        for (const license of payload.licenses) {
          if (license.id) {
            await tx.licenses.update({
              where: { id: license.id },
              data: {
                name: license.name,
                license_level: license.license_level,
                organization: license.organization,
                no_license: license.no_license,
                expired_date: license.expired_date,
                date_of_issue: license.date_of_issue,
                file_link: license.file_link
              }
            })
          } else {
            await tx.licenses.create({
              data: {
                referee_id: referee.id,
                name: license.name,
                license_level: license.license_level,
                organization: license.organization,
                no_license: license.no_license,
                expired_date: license.expired_date,
                date_of_issue: license.date_of_issue,
                file_link: license.file_link || ''
              }
            })
          }
        }
      }

      if (payload.pricing) {
        for (const price of payload.pricing) {
          const refereeSport = await tx.referee_sports.findFirst({
            where: {
              referee_id: referee.id,
              sport_id: price.sport_id
            }
          })

          if (refereeSport) {
            if (price.id) {
              await tx.referee_pricing.update({
                where: { id: price.id },
                data: {
                  amount: price.amount,
                  type_time: price.type_time,
                  type_game: price.type_game
                }
              })
            } else {
              await tx.referee_pricing.create({
                data: {
                  referee_sport_id: refereeSport.id,
                  amount: price.amount,
                  type_time: price.type_time,
                  type_game: price.type_game
                }
              })
            }
          }
        }
      }
    })

    return utils.resSuccess(200, 'Berhasil update profile', null)
  } catch (error) {
    logger.error('ERR: referee - updateRefereeProfile = ', error)
    const formattedError = utils.formatUnexpectedError(error)
    throw formattedError
  }
}

export const getRefereePricing = async (userId: string) => {
  try {
    const referee = await prisma.referees.findFirst({
      where: { user_id: userId },
      include: {
        referee_sports: {
          include: {
            md_sports: {
              select: { id: true, name: true }
            },
            referee_pricing: {
              where: { is_deleted: false },
              select: {
                id: true,
                amount: true,
                type_time: true,
                type_game: true
              }
            }
          }
        }
      }
    })

    if (!referee) {
      return utils.resErr(404, 'Profile referee tidak ditemukan', null)
    }

    const result = referee.referee_sports.map((rs) => ({
      sport_id: rs.md_sports.id,
      sport_name: rs.md_sports.name,
      pricing: rs.referee_pricing
    }))

    return utils.resSuccess(200, 'success', result)
  } catch (error) {
    logger.error('ERR: referee - getRefereePricing = ', error)
    const formattedError = utils.formatUnexpectedError(error)
    throw formattedError
  }
}

export const updateRefereePricing = async (
  userId: string,
  pricing: Array<{
    id?: string
    sport_id: string
    amount: number
    type_time: string
    type_game: string
  }>
) => {
  try {
    const referee = await prisma.referees.findFirst({
      where: { user_id: userId }
    })

    if (!referee) {
      return utils.resErr(404, 'Profile referee tidak ditemukan', null)
    }

    await prisma.$transaction(async (tx) => {
      for (const price of pricing) {
        const refereeSport = await tx.referee_sports.findFirst({
          where: {
            referee_id: referee.id,
            sport_id: price.sport_id
          }
        })

        if (refereeSport) {
          if (price.id) {
            await tx.referee_pricing.update({
              where: { id: price.id },
              data: {
                amount: price.amount,
                type_time: price.type_time,
                type_game: price.type_game
              }
            })
          } else {
            await tx.referee_pricing.create({
              data: {
                referee_sport_id: refereeSport.id,
                amount: price.amount,
                type_time: price.type_time,
                type_game: price.type_game
              }
            })
          }
        }
      }
    })

    return utils.resSuccess(200, 'Berhasil update pricing', null)
  } catch (error) {
    logger.error('ERR: referee - updateRefereePricing = ', error)
    const formattedError = utils.formatUnexpectedError(error)
    throw formattedError
  }
}

export const getLicenses = async (userId: string) => {
  try {
    const referee = await prisma.referees.findFirst({
      where: { user_id: userId }
    })

    if (!referee) {
      return utils.resErr(404, 'Profile referee tidak ditemukan', null)
    }

    const licenses = await prisma.licenses.findMany({
      where: { referee_id: referee.id, is_deleted: false },
      select: {
        id: true,
        name: true,
        license_level: true,
        organization: true,
        no_license: true,
        expired_date: true,
        date_of_issue: true,
        file_link: true,
        is_verified: true
      },
      orderBy: { created_at: 'desc' }
    })

    return utils.resSuccess(200, 'success', licenses)
  } catch (error) {
    logger.error('ERR: referee - getLicenses = ', error)
    const formattedError = utils.formatUnexpectedError(error)
    throw formattedError
  }
}

export const getLicenseById = async (userId: string, licenseId: string) => {
  try {
    const referee = await prisma.referees.findFirst({
      where: { user_id: userId }
    })

    if (!referee) {
      return utils.resErr(404, 'Profile referee tidak ditemukan', null)
    }

    const license = await prisma.licenses.findFirst({
      where: { id: licenseId, referee_id: referee.id, is_deleted: false }
    })

    if (!license) {
      return utils.resErr(404, 'License tidak ditemukan', null)
    }

    return utils.resSuccess(200, 'success', license)
  } catch (error) {
    logger.error('ERR: referee - getLicenseById = ', error)
    const formattedError = utils.formatUnexpectedError(error)
    throw formattedError
  }
}

export const createLicense = async (
  userId: string,
  data: {
    license_level: string
    organization: string
    no_license: string
    expired_date: Date
    date_of_issue: Date
    file_link?: string
  }
) => {
  try {
    const referee = await prisma.referees.findFirst({
      where: { user_id: userId }
    })

    if (!referee) {
      return utils.resErr(404, 'Profile referee tidak ditemukan', null)
    }

    const count = await prisma.licenses.count({
      where: { referee_id: referee.id, is_deleted: false }
    })

    const license = await prisma.licenses.create({
      data: {
        referee_id: referee.id,
        name: `Lisensi ${count + 1}`,
        license_level: data.license_level,
        organization: data.organization,
        no_license: data.no_license,
        expired_date: data.expired_date,
        date_of_issue: data.date_of_issue,
        file_link: data.file_link || '',
        is_verified: false
      }
    })

    return utils.resSuccess(201, 'Berhasil membuat license, menunggu verifikasi admin', license)
  } catch (error) {
    logger.error('ERR: referee - createLicense = ', error)
    const formattedError = utils.formatUnexpectedError(error)
    throw formattedError
  }
}

export const updateLicense = async (
  userId: string,
  licenseId: string,
  data: {
    license_level?: string
    organization?: string
    no_license?: string
    expired_date?: Date
    date_of_issue?: Date
    file_link?: string
  }
) => {
  try {
    const referee = await prisma.referees.findFirst({
      where: { user_id: userId }
    })

    if (!referee) {
      return utils.resErr(404, 'Profile referee tidak ditemukan', null)
    }

    const existing = await prisma.licenses.findFirst({
      where: { id: licenseId, referee_id: referee.id, is_deleted: false }
    })

    if (!existing) {
      return utils.resErr(404, 'License tidak ditemukan', null)
    }

    const license = await prisma.licenses.update({
      where: { id: licenseId },
      data: {
        license_level: data.license_level ?? existing.license_level,
        organization: data.organization ?? existing.organization,
        no_license: data.no_license ?? existing.no_license,
        expired_date: data.expired_date ?? existing.expired_date,
        date_of_issue: data.date_of_issue ?? existing.date_of_issue,
        file_link: data.file_link ?? existing.file_link,
        is_verified: false
      }
    })

    return utils.resSuccess(200, 'Berhasil update license, menunggu verifikasi admin', license)
  } catch (error) {
    logger.error('ERR: referee - updateLicense = ', error)
    const formattedError = utils.formatUnexpectedError(error)
    throw formattedError
  }
}

export const deleteLicense = async (userId: string, licenseId: string) => {
  try {
    const referee = await prisma.referees.findFirst({
      where: { user_id: userId }
    })

    if (!referee) {
      return utils.resErr(404, 'Profile referee tidak ditemukan', null)
    }

    const existing = await prisma.licenses.findFirst({
      where: { id: licenseId, referee_id: referee.id, is_deleted: false }
    })

    if (!existing) {
      return utils.resErr(404, 'License tidak ditemukan', null)
    }

    await prisma.licenses.update({
      where: { id: licenseId },
      data: { is_deleted: true }
    })

    return utils.resSuccess(200, 'Berhasil menghapus license', null)
  } catch (error) {
    logger.error('ERR: referee - deleteLicense = ', error)
    const formattedError = utils.formatUnexpectedError(error)
    throw formattedError
  }
}

export const verifyLicense = async (licenseId: string) => {
  try {
    const license = await prisma.licenses.findUnique({
      where: { id: licenseId }
    })

    if (!license) {
      return utils.resErr(404, 'License tidak ditemukan', null)
    }

    const updated = await prisma.licenses.update({
      where: { id: licenseId },
      data: { is_verified: true }
    })

    return utils.resSuccess(200, 'Berhasil verifikasi license', updated)
  } catch (error) {
    logger.error('ERR: referee - verifyLicense = ', error)
    const formattedError = utils.formatUnexpectedError(error)
    throw formattedError
  }
}

export const getAllPublicReferees = async (
  search?: string,
  sortBy?: string,
  name?: string,
  city?: string,
  province?: string,
  sports?: string
) => {
  try {
    const userFilters: Record<string, any> = {
      is_deleted: false,
      is_active: true
    }

    if (search) {
      userFilters.name = { ...userFilters.name, contains: search, mode: 'insensitive' }
    }

    if (name) {
      userFilters.name = { ...userFilters.name, contains: name, mode: 'insensitive' }
    }

    if (city) {
      userFilters.city = { contains: city, mode: 'insensitive' }
    }

    if (province) {
      userFilters.province = { contains: province, mode: 'insensitive' }
    }

    const sportsFilter: Record<string, any> | undefined = sports
      ? {
          some: {
            md_sports: {
              name: { contains: sports, mode: 'insensitive' }
            }
          }
        }
      : undefined

    const whereClause: Record<string, any> = {
      is_verification: true,
      users: userFilters
    }

    if (sportsFilter) {
      whereClause.referee_sports = sportsFilter
    }

    const referees = await prisma.referees.findMany({
      where: whereClause,
      include: {
        users: {
          select: {
            name: true,
            email: true,
            phone: true,
            photo: true,
            province: true,
            city: true,
            is_active: true
          }
        },
        licenses: {
          where: {
            is_deleted: false,
            is_verified: true
          },
          select: {
            license_level: true
          }
        },
        referee_sports: {
          include: {
            md_sports: {
              select: { name: true }
            },
            referee_pricing: {
              where: { is_deleted: false },
              select: {
                amount: true,
                type_time: true,
                type_game: true
              }
            }
          }
        },
        booking_details: {
          include: {
            bookings: {
              include: {
                payments: {
                  where: { status: 'SUCCESS' }
                }
              }
            }
          }
        },
        ratings: {
          select: {
            rating: true
          }
        }
      }
    })

    const result = referees.map((ref) => {
      const avgRating =
        ref.ratings.length > 0 ? ref.ratings.reduce((sum, r) => sum + Number(r.rating), 0) / ref.ratings.length : null

      const completedBookings = ref.booking_details.filter(
        (bd) => bd.bookings && bd.bookings.payments && bd.bookings.payments.length > 0
      ).length

      const minPrice =
        ref.referee_sports.flatMap((rs) => rs.referee_pricing).length > 0
          ? Math.min(...ref.referee_sports.flatMap((rs) => rs.referee_pricing).map((p) => p.amount))
          : null

      return {
        id: ref.id,
        user_id: ref.user_id,
        bio: ref.bio,
        photo_profile: ref.photo_profile,
        photos: ref.photos,
        referee_name: ref.users.name,
        province: ref.users.province,
        city: ref.users.city,
        sports: ref.referee_sports.map((rs) => ({
          name: rs.md_sports.name
        })),
        license: ref.licenses.length > 0 ? ref.licenses[0].license_level : null,
        pricing: ref.referee_sports.flatMap((rs) => rs.referee_pricing),
        min_price: minPrice,
        average_rating: avgRating ? Math.round(avgRating * 100) / 100 : null,
        total_rating: ref.ratings.length,
        completed_bookings: completedBookings
      }
    })

    switch (sortBy) {
      case 'price_highest':
        result.sort((a, b) => (b.min_price || 0) - (a.min_price || 0))
        break
      case 'price_lowest':
        result.sort((a, b) => (a.min_price || 0) - (b.min_price || 0))
        break
      case 'rating_highest':
        result.sort((a, b) => {
          if (b.average_rating === null && a.average_rating === null) return 0
          if (b.average_rating === null) return 1
          if (a.average_rating === null) return -1
          return b.average_rating - a.average_rating
        })
        break
      case 'review_most':
        result.sort((a, b) => b.total_rating - a.total_rating)
        break
      default:
        result.sort((a, b) => (a.referee_name || '').localeCompare(b.referee_name || ''))
    }

    return utils.resSuccess(200, 'success', result)
  } catch (error) {
    logger.error('ERR: referee - getAllPublicReferees = ', error)
    const formattedError = utils.formatUnexpectedError(error)
    throw formattedError
  }
}

export const getPublicRefereeById = async (id: string) => {
  try {
    const referee = await prisma.referees.findUnique({
      where: {
        id,
        is_verification: true,
        users: { is_deleted: false, is_active: true }
      },
      include: {
        users: {
          select: {
            name: true,
            email: true,
            phone: true,
            photo: true,
            province: true,
            city: true,
            is_active: true
          }
        },
        licenses: {
          where: {
            is_deleted: false,
            is_verified: true
          },
          select: {
            license_level: true,
            expired_date: true
          }
        },
        referee_sports: {
          include: {
            md_sports: {
              select: { name: true }
            },
            referee_pricing: {
              where: { is_deleted: false },
              select: {
                amount: true,
                type_time: true,
                type_game: true
              }
            }
          }
        },
        booking_details: {
          include: {
            bookings: {
              include: {
                payments: {
                  where: { status: 'SUCCESS' }
                }
              }
            }
          }
        },
        ratings: {
          select: {
            rating: true,
            comments: true,
            photos: true,
            created_at: true
          }
        }
      }
    })

    if (!referee) {
      return utils.resErr(404, 'Referee tidak ditemukan', null)
    }

    const now = new Date()

    const avgRating =
      referee.ratings.length > 0
        ? referee.ratings.reduce((sum, r) => sum + Number(r.rating), 0) / referee.ratings.length
        : null

    const completedBookings = referee.booking_details.filter(
      (bd) => bd.bookings && bd.bookings.payments && bd.bookings.payments.length > 0
    ).length

    const validLicenses = referee.licenses.map((lic) => ({
      ...lic,
      is_expired: lic.expired_date < now
    }))

    const result = {
      id: referee.id,
      user_id: referee.user_id,
      bio: referee.bio,
      photo_profile: referee.photo_profile,
      photos: referee.photos,
      user: {
        name: referee.users.name,
        email: referee.users.email,
        phone: referee.users.phone,
        photo: referee.users.photo,
        province: referee.users.province,
        city: referee.users.city
      },
      licenses: validLicenses.length > 0 ? validLicenses[0].license_level : null,
      sports: referee.referee_sports.map((rs) => ({
        name: rs.md_sports.name
      })),
      average_rating: avgRating ? Math.round(avgRating * 100) / 100 : null,
      pricing: referee.referee_sports.flatMap((rs) => rs.referee_pricing),
      total_rating: referee.ratings.length,
      completed_bookings: completedBookings,
      ratings: referee.ratings
    }

    return utils.resSuccess(200, 'success', result)
  } catch (error) {
    logger.error('ERR: referee - getPublicRefereeById = ', error)
    const formattedError = utils.formatUnexpectedError(error)
    throw formattedError
  }
}

export const getRefereeAvailability = async (userId: string) => {
  try {
    const referee = await prisma.referees.findFirst({
      where: { user_id: userId }
    })

    if (!referee) {
      return utils.resErr(404, 'Profile referee tidak ditemukan', null)
    }

    const availability = await prisma.referee_availability.findMany({
      where: { referee_id: referee.id, is_deleted: false },
      select: {
        id: true,
        date: true,
        start_time: true,
        end_time: true
      },
      orderBy: { date: 'asc' }
    })

    return utils.resSuccess(200, 'success', availability)
  } catch (error) {
    logger.error('ERR: referee - getRefereeAvailability = ', error)
    const formattedError = utils.formatUnexpectedError(error)
    throw formattedError
  }
}

export const updateRefereeAvailability = async (
  userId: string,
  availability: Array<{
    id?: string
    date: string
    start_time: string
    end_time: string
  }>
) => {
  try {
    const referee = await prisma.referees.findFirst({
      where: { user_id: userId }
    })

    if (!referee) {
      return utils.resErr(404, 'Profile referee tidak ditemukan', null)
    }

    await prisma.$transaction(async (tx) => {
      for (const item of availability) {
        const dateObj = new Date(item.date)

        if (item.id) {
          const existing = await tx.referee_availability.findFirst({
            where: { id: item.id, referee_id: referee.id, is_deleted: false }
          })

          if (existing) {
            await tx.referee_availability.update({
              where: { id: item.id },
              data: {
                date: dateObj,
                start_time: item.start_time,
                end_time: item.end_time,
                updated_at: new Date()
              }
            })
          }
        } else {
          await tx.referee_availability.create({
            data: {
              referee_id: referee.id,
              date: dateObj,
              start_time: item.start_time,
              end_time: item.end_time
            }
          })
        }
      }
    })

    return utils.resSuccess(200, 'Berhasil update ketersediaan', null)
  } catch (error) {
    logger.error('ERR: referee - updateRefereeAvailability = ', error)
    const formattedError = utils.formatUnexpectedError(error)
    throw formattedError
  }
}

export const deleteRefereeAvailability = async (userId: string, availabilityId: string) => {
  try {
    const referee = await prisma.referees.findFirst({
      where: { user_id: userId }
    })

    if (!referee) {
      return utils.resErr(404, 'Profile referee tidak ditemukan', null)
    }

    const existing = await prisma.referee_availability.findFirst({
      where: { id: availabilityId, referee_id: referee.id, is_deleted: false }
    })

    if (!existing) {
      return utils.resErr(404, 'Ketersediaan tidak ditemukan', null)
    }

    await prisma.referee_availability.update({
      where: { id: availabilityId },
      data: { is_deleted: true, updated_at: new Date() }
    })

    return utils.resSuccess(200, 'Berhasil menghapus ketersediaan', null)
  } catch (error) {
    logger.error('ERR: referee - deleteRefereeAvailability = ', error)
    const formattedError = utils.formatUnexpectedError(error)
    throw formattedError
  }
}

export const getPublicRefereeAvailability = async (id: string, typeTime: string) => {
  try {
    const referee = await prisma.referees.findUnique({
      where: {
        id,
        is_verification: true,
        users: { is_deleted: false, is_active: true }
      },
      include: {
        users: {
          select: {
            name: true
          }
        }
      }
    })

    if (!referee) {
      return utils.resErr(404, 'Referee tidak ditemukan', null)
    }

    const now = new Date()
    const todayStart = startOfDay(now)

    const availabilities = await prisma.referee_availability.findMany({
      where: {
        referee_id: id,
        date: {
          gte: todayStart
        },
        is_deleted: false
      },
      orderBy: { date: 'asc' }
    })

    if (availabilities.length === 0) {
      return utils.resSuccess(200, 'success', {
        referee_id: id,
        referee_name: referee.users?.name || null,
        match_type: typeTime,
        available_dates: []
      })
    }

    const bookedSchedules = await prisma.booking_details.findMany({
      where: {
        referee_id: id,
        bookings: {
          payments: {
            some: {
              status: {
                in: ['PENDING', 'SUCCESS']
              }
            }
          }
        }
      },
      include: {
        bookings: {
          include: {
            schedules: true
          }
        }
      }
    })

    const slotDuration = typeTime === 'per_2_hours' ? 2 : 1
    const availableDates: Array<{
      date: string
      availability: { start_time: string; end_time: string }
      available_slots: Array<{ start: string; end: string }>
    }> = []

    for (const availability of availabilities) {
      const selectedDate = new Date(availability.date)
      const dayStart = startOfDay(selectedDate)
      const dayEnd = endOfDay(selectedDate)

      const bookedSlots: Array<{ start: string; end: string }> = []

      for (const bd of bookedSchedules) {
        const schedule = bd.bookings.schedules
        if (schedule.date >= dayStart && schedule.date <= dayEnd) {
          bookedSlots.push({
            start: format(schedule.start_time, 'HH:mm'),
            end: format(schedule.end_time, 'HH:mm')
          })
        }
      }

      const availableSlots: Array<{ start: string; end: string }> = []
      let currentTime = parse(availability.start_time, 'HH:mm', selectedDate)
      const endLimit = parse(availability.end_time, 'HH:mm', selectedDate)

      const effectiveStartTime = isSameDay(selectedDate, now) ? now : selectedDate

      if (isSameDay(selectedDate, now)) {
        currentTime = parse(format(now, 'HH:mm'), 'HH:mm', selectedDate)
      }

      while (currentTime < endLimit) {
        const slotStart = format(currentTime, 'HH:mm')
        const slotEndTime = addHours(currentTime, slotDuration)
        const slotEnd = format(slotEndTime, 'HH:mm')

        if (slotEndTime <= endLimit) {
          const isBooked = bookedSlots.some((booked) => {
            const bookedStart = parse(booked.start, 'HH:mm', selectedDate)
            const bookedEnd = parse(booked.end, 'HH:mm', selectedDate)
            return (
              (currentTime >= bookedStart && currentTime < bookedEnd) ||
              (slotEndTime > bookedStart && slotEndTime <= bookedEnd) ||
              (currentTime <= bookedStart && slotEndTime >= bookedEnd)
            )
          })

          if (!isBooked) {
            availableSlots.push({ start: slotStart, end: slotEnd })
          }
        }

        currentTime = slotEndTime
      }

      if (availableSlots.length > 0) {
        availableDates.push({
          date: format(availability.date, 'yyyy-MM-dd'),
          availability: {
            start_time: availability.start_time,
            end_time: availability.end_time
          },
          available_slots: availableSlots
        })
      }
    }

    return utils.resSuccess(200, 'success', {
      referee_id: id,
      referee_name: referee.users?.name || null,
      match_type: typeTime,
      available_dates: availableDates
    })
  } catch (error) {
    logger.error('ERR: referee - getPublicRefereeAvailability = ', error)
    const formattedError = utils.formatUnexpectedError(error)
    throw formattedError
  }
}

export const getRecommendedReferees = async (id: string) => {
  try {
    const mainReferee = await prisma.referees.findUnique({
      where: {
        id,
        is_verification: true,
        users: { is_deleted: false, is_active: true }
      },
      include: {
        users: {
          select: {
            name: true,
            city: true
          }
        },
        licenses: {
          where: { is_deleted: false, is_verified: true },
          orderBy: { license_level: 'desc' },
          take: 1
        },
        referee_sports: {
          include: {
            md_sports: {
              select: { id: true, name: true }
            },
            referee_pricing: {
              where: { is_deleted: false },
              orderBy: { amount: 'asc' },
              take: 1
            }
          }
        },
        ratings: {
          select: { rating: true }
        }
      }
    })

    if (!mainReferee) {
      return utils.resErr(404, 'Referee tidak ditemukan', null)
    }

    const mainLicenseLevel = mainReferee.licenses[0]?.license_level
    const mainMaxPrice = mainReferee.referee_sports[0]?.referee_pricing[0]?.amount
    const mainCity = mainReferee.users?.city
    // ✅ Ambil sport_id dari mainReferee untuk dipakai di filter bawah
    const mainSportId = mainReferee.referee_sports[0]?.sport_id

    if (!mainLicenseLevel || !mainMaxPrice) {
      return utils.resErr(400, 'Referee utama tidak memiliki license atau pricing', null)
    }

    const recommendedReferees = await prisma.referees.findMany({
      where: {
        id: { not: id },
        is_verification: true,
        users: { is_deleted: false, is_active: true },
        licenses: {
          some: {
            license_level: mainLicenseLevel,
            is_deleted: false,
            is_verified: true
          }
        }
      },
      include: {
        users: {
          select: {
            name: true,
            province: true,
            city: true
          }
        },
        licenses: {
          where: { is_deleted: false, is_verified: true, license_level: mainLicenseLevel },
          select: {
            license_level: true
          }
        },
        referee_sports: {
          // ✅ Filter sport_id di sini, bukan di dalam md_sports
          where: { sport_id: mainSportId ?? undefined },
          include: {
            md_sports: {
              select: { name: true }
            },
            referee_pricing: {
              where: { is_deleted: false },
              select: {
                amount: true,
                type_time: true,
                type_game: true
              }
            }
          }
        },
        ratings: {
          select: { rating: true }
        },
        booking_details: {
          include: {
            bookings: {
              include: {
                payments: {
                  where: { status: 'SUCCESS' }
                }
              }
            }
          }
        }
      }
    })

    const filteredReferees = recommendedReferees.filter((ref) => {
      const refPrice = ref.referee_sports[0]?.referee_pricing[0]?.amount
      return refPrice && refPrice <= mainMaxPrice
    })

    const result = filteredReferees.map((ref) => {
      const avgRating =
        ref.ratings.length > 0
          ? ref.ratings.reduce((sum: number, r: { rating: unknown }) => sum + Number(r.rating), 0) / ref.ratings.length
          : null

      const completedBookings = ref.booking_details.filter(
        (bd) => bd.bookings && bd.bookings.payments && bd.bookings.payments.length > 0
      ).length

      const cityMatch = mainCity && ref.users.city === mainCity

      return {
        id: ref.id,
        name: ref.users.name,
        province: ref.users.province,
        city: ref.users.city,
        license_level: ref.licenses[0]?.license_level,
        sport: ref.referee_sports[0]?.md_sports?.name,
        pricing: ref.referee_sports[0]?.referee_pricing,
        average_rating: avgRating ? Math.round(avgRating * 100) / 100 : null,
        total_rating: ref.ratings.length,
        completed_bookings: completedBookings,
        is_same_city: cityMatch || false
      }
    })

    result.sort((a, b) => {
      if (a.is_same_city !== b.is_same_city) {
        return a.is_same_city ? -1 : 1
      }
      if (b.average_rating !== a.average_rating) {
        if (b.average_rating === null) return 1
        if (a.average_rating === null) return -1
        return b.average_rating - a.average_rating
      }
      if (b.total_rating !== a.total_rating) {
        return b.total_rating - a.total_rating
      }
      return b.completed_bookings - a.completed_bookings
    })

    return utils.resSuccess(200, 'success', {
      main_referee: {
        id: mainReferee.id,
        name: mainReferee.users?.name,
        city: mainCity,
        license_level: mainLicenseLevel,
        max_price: mainMaxPrice
      },
      recommendations: result
    })
  } catch (error) {
    logger.error('ERR: referee - getRecommendedReferees = ', error)
    const formattedError = utils.formatUnexpectedError(error)
    throw formattedError
  }
}
