import { type Request, type Response } from 'express'
import { logger } from '../config/logger'
import { getAllReferees, getRefereeById, updateReferee, deleteReferee, verifyReferee, activateReferee, deactivateReferee, getRefereeProfile, updateRefereeProfile, getRefereePricing, updateRefereePricing, getLicenses, getLicenseById, createLicense, updateLicense, deleteLicense, verifyLicense, getAllPublicReferees, getPublicRefereeById, getRefereeAvailability, updateRefereeAvailability, deleteRefereeAvailability, getPublicRefereeAvailability as getPublicRefereeAvailabilityService, getRecommendedReferees } from '../services/referee.service'
import { sendSuccess, sendError, sendNotFound, sendBadRequest } from '../utils/response.helper'
import { uploadImage } from '../services/upload.service'

export const getReferees = async (req: Request, res: Response) => {
  try {
    const data = await getAllReferees()
    sendSuccess(res, data.data, 'Berhasil mendapatkan data referee')
  } catch (error) {
    logger.error('ERR: referee - getReferees = ', error)
    sendError(res, 'Terjadi kesalahan server', 500)
  }
}

export const getReferee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const data = await getRefereeById(id)

    if (!data.status) {
      return sendNotFound(res, 'Referee')
    }

    sendSuccess(res, data.data, 'Berhasil mendapatkan data referee')
  } catch (error) {
    logger.error('ERR: referee - getReferee = ', error)
    sendError(res, 'Terjadi kesalahan server', 500)
  }
}

export const updateRefereeData = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { bio, is_verification, photos } = req.body

    const data = await updateReferee(id, { bio, is_verification, photos })

    if (!data.status) {
      return sendNotFound(res, 'Referee')
    }

    sendSuccess(res, data.data, 'Berhasil update referee')
  } catch (error) {
    logger.error('ERR: referee - updateRefereeData = ', error)
    sendError(res, 'Terjadi kesalahan server', 500)
  }
}

export const deleteRefereeData = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const data = await deleteReferee(id)

    if (!data.status) {
      return sendNotFound(res, 'Referee')
    }

    sendSuccess(res, null, 'Berhasil menghapus referee')
  } catch (error) {
    logger.error('ERR: referee - deleteRefereeData = ', error)
    sendError(res, 'Terjadi kesalahan server', 500)
  }
}

export const verifyRefereeData = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { is_verified, reason } = req.body

    if (typeof is_verified !== 'boolean') {
      return void sendError(res, 'is_verified wajib diisi (true/false)', 400)
    }

    const data = await verifyReferee(id, is_verified, reason)

    if (!data.status) {
      return sendNotFound(res, 'Referee')
    }

    sendSuccess(res, data.data, data.message)
  } catch (error) {
    logger.error('ERR: referee - verifyRefereeData = ', error)
    sendError(res, 'Terjadi kesalahan server', 500)
  }
}

export const activateRefereeData = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const data = await activateReferee(id)

    if (!data.status) {
      return sendNotFound(res, 'Referee')
    }

    sendSuccess(res, data.data, 'Berhasil mengaktifkan referee')
  } catch (error) {
    logger.error('ERR: referee - activateRefereeData = ', error)
    sendError(res, 'Terjadi kesalahan server', 500)
  }
}

export const deactivateRefereeData = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const data = await deactivateReferee(id)

    if (!data.status) {
      return sendNotFound(res, 'Referee')
    }

    sendSuccess(res, data.data, 'Berhasil menonaktifkan referee')
  } catch (error) {
    logger.error('ERR: referee - deactivateRefereeData = ', error)
    sendError(res, 'Terjadi kesalahan server', 500)
  }
}

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.locals.sub
    const data = await getRefereeProfile(userId)

    if (!data.status) {
      return sendNotFound(res, 'Profile referee')
    }

    sendSuccess(res, data.data, 'Berhasil mendapatkan profile')
  } catch (error) {
    logger.error('ERR: referee - getProfile = ', error)
    sendError(res, 'Terjadi kesalahan server', 500)
  }
}

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.locals.sub
    const files = req.files as Record<string, Express.Multer.File[]>
    const { name, phone, province, city, bio, licenses, pricing } = req.body

    let photoProfile: string | undefined
    let photoUrls: string[] | undefined
    let licenseFiles: string[] | undefined

    if (files?.photo_profile) {
      photoProfile = await uploadImage(files.photo_profile[0])
    }

    if (files?.photos) {
      photoUrls = await Promise.all(files.photos.map((f) => uploadImage(f)))
    }

    if (files?.license_files) {
      licenseFiles = await Promise.all(files.license_files.map((f) => uploadImage(f)))
    }

    let parsedLicenses = licenses
    if (typeof licenses === 'string') {
      parsedLicenses = JSON.parse(licenses)
    }

    let parsedPricing = pricing
    if (typeof pricing === 'string') {
      parsedPricing = JSON.parse(pricing)
    }

    if (parsedLicenses && Array.isArray(parsedLicenses) && licenseFiles) {
      parsedLicenses = parsedLicenses.map((lic: any, index: number) => ({
        ...lic,
        file_link: lic.file_link || licenseFiles[index] || ''
      }))
    }

    const data = await updateRefereeProfile(userId, {
      name,
      phone,
      photo_profile: photoProfile,
      province,
      city,
      bio,
      photos: photoUrls,
      licenses: parsedLicenses,
      pricing: parsedPricing
    })

    if (!data.status) {
      return sendNotFound(res, 'Profile referee')
    }

    sendSuccess(res, data.data, 'Berhasil update profile')
  } catch (error) {
    logger.error('ERR: referee - updateProfile = ', error)
    sendError(res, 'Terjadi kesalahan server', 500)
  }
}

export const getPricing = async (req: Request, res: Response) => {
  try {
    const userId = req.locals.sub
    const data = await getRefereePricing(userId)

    if (!data.status) {
      return sendNotFound(res, 'Pricing')
    }

    sendSuccess(res, data.data, 'Berhasil mendapatkan pricing')
  } catch (error) {
    logger.error('ERR: referee - getPricing = ', error)
    sendError(res, 'Terjadi kesalahan server', 500)
  }
}

export const updatePricing = async (req: Request, res: Response) => {
  try {
    const userId = req.locals.sub
    const { pricing } = req.body

    const data = await updateRefereePricing(userId, pricing)

    if (!data.status) {
      return sendNotFound(res, 'Pricing')
    }

    sendSuccess(res, data.data, 'Berhasil update pricing')
  } catch (error) {
    logger.error('ERR: referee - updatePricing = ', error)
    sendError(res, 'Terjadi kesalahan server', 500)
  }
}

export const getLicensesData = async (req: Request, res: Response) => {
  try {
    const userId = req.locals.sub
    const data = await getLicenses(userId)

    if (!data.status) {
      return sendNotFound(res, 'Licenses')
    }

    sendSuccess(res, data.data, 'Berhasil mendapatkan licenses')
  } catch (error) {
    logger.error('ERR: referee - getLicensesData = ', error)
    sendError(res, 'Terjadi kesalahan server', 500)
  }
}

export const getLicenseData = async (req: Request, res: Response) => {
  try {
    const userId = req.locals.sub
    const { id } = req.params
    const data = await getLicenseById(userId, id)

    if (!data.status) {
      return sendNotFound(res, 'License')
    }

    sendSuccess(res, data.data, 'Berhasil mendapatkan license')
  } catch (error) {
    logger.error('ERR: referee - getLicenseData = ', error)
    sendError(res, 'Terjadi kesalahan server', 500)
  }
}

export const createLicenseData = async (req: Request, res: Response) => {
  try {
    const userId = req.locals.sub
    const file = req.file
    const { license_level, organization, no_license, expired_date, date_of_issue } = req.body

    let fileLink = ''
    if (file) {
      fileLink = await uploadImage(file)
    }

    const data = await createLicense(userId, {
      license_level,
      organization,
      no_license,
      expired_date: new Date(expired_date),
      date_of_issue: new Date(date_of_issue),
      file_link: fileLink
    })

    if (!data.status) {
      return sendNotFound(res, 'License')
    }

    sendSuccess(res, data.data, data.message)
  } catch (error) {
    logger.error('ERR: referee - createLicenseData = ', error)
    sendError(res, 'Terjadi kesalahan server', 500)
  }
}

export const updateLicenseData = async (req: Request, res: Response) => {
  try {
    const userId = req.locals.sub
    const { id } = req.params
    const file = req.file
    const { license_level, organization, no_license, expired_date, date_of_issue } = req.body

    let fileLink: string | undefined
    if (file) {
      fileLink = await uploadImage(file)
    }

    const updateData: any = {}
    if (license_level) updateData.license_level = license_level
    if (organization) updateData.organization = organization
    if (no_license) updateData.no_license = no_license
    if (expired_date) updateData.expired_date = new Date(expired_date)
    if (date_of_issue) updateData.date_of_issue = new Date(date_of_issue)
    if (fileLink) updateData.file_link = fileLink

    const data = await updateLicense(userId, id, updateData)

    if (!data.status) {
      return sendNotFound(res, 'License')
    }

    sendSuccess(res, data.data, data.message)
  } catch (error) {
    logger.error('ERR: referee - updateLicenseData = ', error)
    sendError(res, 'Terjadi kesalahan server', 500)
  }
}

export const deleteLicenseData = async (req: Request, res: Response) => {
  try {
    const userId = req.locals.sub
    const { id } = req.params
    const data = await deleteLicense(userId, id)

    if (!data.status) {
      return sendNotFound(res, 'License')
    }

    sendSuccess(res, data.data, 'Berhasil menghapus license')
  } catch (error) {
    logger.error('ERR: referee - deleteLicenseData = ', error)
    sendError(res, 'Terjadi kesalahan server', 500)
  }
}

export const verifyLicenseData = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const data = await verifyLicense(id)

    if (!data.status) {
      return sendNotFound(res, 'License')
    }

    sendSuccess(res, data.data, 'Berhasil verifikasi license')
  } catch (error) {
    logger.error('ERR: referee - verifyLicenseData = ', error)
    sendError(res, 'Terjadi kesalahan server', 500)
  }
}

export const getPublicReferees = async (req: Request, res: Response) => {
  try {
    const { search, sort_by, name, city, province, sports } = req.query

    const searchTerm = typeof search === 'string' ? search : undefined
    const sortBy = typeof sort_by === 'string' ? sort_by : undefined
    const filterName = typeof name === 'string' ? name : undefined
    const filterCity = typeof city === 'string' ? city : undefined
    const filterProvince = typeof province === 'string' ? province : undefined
    const filterSports = typeof sports === 'string' ? sports : undefined

    if (sortBy && !['price_highest', 'price_lowest', 'rating_highest', 'review_most'].includes(sortBy)) {
      return sendBadRequest(res, 'sort_by harus price_highest, price_lowest, rating_highest, atau review_most')
    }

    const data = await getAllPublicReferees(searchTerm, sortBy, filterName, filterCity, filterProvince, filterSports)
    sendSuccess(res, data.data, 'Berhasil mendapatkan data referee')
  } catch (error) {
    logger.error('ERR: referee - getPublicReferees = ', error)
    sendError(res, 'Terjadi kesalahan server', 500)
  }
}

export const getPublicReferee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const data = await getPublicRefereeById(id)

    if (!data.status) {
      return sendNotFound(res, 'Referee')
    }

    sendSuccess(res, data.data, 'Berhasil mendapatkan data referee')
  } catch (error) {
    logger.error('ERR: referee - getPublicReferee = ', error)
    sendError(res, 'Terjadi kesalahan server', 500)
  }
}

export const getAvailability = async (req: Request, res: Response) => {
  try {
    const userId = req.locals.sub
    const data = await getRefereeAvailability(userId)

    if (!data.status) {
      return sendNotFound(res, 'Ketersediaan')
    }

    sendSuccess(res, data.data, 'Berhasil mendapatkan ketersediaan')
  } catch (error) {
    logger.error('ERR: referee - getAvailability = ', error)
    sendError(res, 'Terjadi kesalahan server', 500)
  }
}

export const updateAvailability = async (req: Request, res: Response) => {
  try {
    const userId = req.locals.sub
    const { availability } = req.body

    if (!availability || !Array.isArray(availability)) {
      return sendError(res, 'Availability wajib diisi', 400)
    }

    const data = await updateRefereeAvailability(userId, availability)

    if (!data.status) {
      return sendNotFound(res, 'Ketersediaan')
    }

    sendSuccess(res, data.data, data.message)
  } catch (error) {
    logger.error('ERR: referee - updateAvailability = ', error)
    sendError(res, 'Terjadi kesalahan server', 500)
  }
}

export const deleteAvailability = async (req: Request, res: Response) => {
  try {
    const userId = req.locals.sub
    const { id } = req.params

    const data = await deleteRefereeAvailability(userId, id)

    if (!data.status) {
      return sendNotFound(res, 'Ketersediaan')
    }

    sendSuccess(res, data.data, data.message)
  } catch (error) {
    logger.error('ERR: referee - deleteAvailability = ', error)
    sendError(res, 'Terjadi kesalahan server', 500)
  }
}

export const getPublicRefereeAvailabilityController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { type_time } = req.query

    if (!type_time || typeof type_time !== 'string') {
      return sendBadRequest(res, 'Parameter type_time wajib diisi (per_hour atau per_2_hours)')
    }

    if (!['per_hour', 'per_2_hours'].includes(type_time)) {
      return sendBadRequest(res, 'type_time harus per_hour atau per_2_hours')
    }

    const data = await getPublicRefereeAvailabilityService(id, type_time)

    if (!data.status) {
      return sendNotFound(res, 'Referee')
    }

    sendSuccess(res, data.data, 'Berhasil mendapatkan ketersediaan')
  } catch (error) {
    logger.error('ERR: referee - getPublicRefereeAvailability = ', error)
    sendError(res, 'Terjadi kesalahan server', 500)
  }
}

export const getRecommendedRefereesController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const data = await getRecommendedReferees(id)

    if (!data.status) {
      if (data.code === 404) {
        return sendNotFound(res, 'Referee')
      }
      if (data.code === 400) {
        return sendBadRequest(res, data.message)
      }
      return sendError(res, data.message, data.code)
    }

    sendSuccess(res, data.data, 'Berhasil mendapatkan rekomendasi referee')
  } catch (error) {
    logger.error('ERR: referee - getRecommendedReferees = ', error)
    sendError(res, 'Terjadi kesalahan server', 500)
  }
}
