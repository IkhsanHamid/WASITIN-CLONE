import { type Request, type Response } from 'express'
import {
  findAllCities,
  findAllProvinces,
  findByCodeCity,
  findByCodeProvince,
  findByCodeProvinceWithCities,
  findByIdCityWithProvince,
  findByIdProvince,
  findByIdProvinceWithCities
} from '../services/region.service'
import { CityQueryParams, CityType, ProvinceQueryParams } from '../types/region.type'
import { sendBadRequest, sendError, sendNotFound, sendSuccess } from '../utils/response.helper'

// ===================== START : PROVINCE ========================
/**
 * GET /provinces
 * Query: ?search=jawa&page=1&limit=10
 */
export const getAllProvinces = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, page, limit } = req.query

    const params: ProvinceQueryParams = {
      search: search as string | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined
    }

    if (params.page !== undefined && (isNaN(params.page) || params.page < 1)) {
      return void sendBadRequest(res, "Parameter 'page' harus berupa angka positif")
    }
    if (params.limit !== undefined && (isNaN(params.limit) || params.limit < 1 || params.limit > 100)) {
      return void sendBadRequest(res, "Parameter 'limit' harus antara 1 dan 100")
    }

    const result = await findAllProvinces(params)
    sendSuccess(res, result.data, 'Berhasil mengambil data provinsi', 200, result.meta)
  } catch (error) {
    sendError(res, 'Terjadi kesalahan server', 500, error)
  }
}

/**
 * GET /provinces/:id
 * Mendukung UUID maupun kode Kemendagri (contoh: "32")
 */
export const getOneProvince = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    // Deteksi apakah pakai UUID atau kode
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    const province = isUuid ? await findByIdProvince(id) : await findByCodeProvince(id)

    if (!province) {
      sendNotFound(res, 'Provinsi')
      return
    }

    sendSuccess(res, province, 'Berhasil mengambil data provinsi')
  } catch (error) {
    sendError(res, 'Terjadi kesalahan server', 500, error)
  }
}

/**
 * GET /provinces/:id/cities
 * Mendapatkan provinsi beserta seluruh kota/kabupatennya
 * Mendukung UUID maupun kode Kemendagri
 * Query: ?type=KABUPATEN|KOTA
 */
export const getCityByProvince = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    const province = isUuid ? await findByIdProvinceWithCities(id) : await findByCodeProvinceWithCities(id)

    if (!province) {
      sendNotFound(res, 'Provinsi')
      return
    }

    // Filter by type jika ada
    const { type } = req.query
    let cities = province.cities

    if (type) {
      const typeUpper = (type as string).toUpperCase()
      if (!['KABUPATEN', 'KOTA'].includes(typeUpper)) {
        sendBadRequest(res, "Parameter 'type' harus KABUPATEN atau KOTA")
        return
      }
      cities = cities.filter((c) => c.type === typeUpper)
    }

    sendSuccess(res, { ...province, cities }, `Berhasil mengambil data kota/kabupaten provinsi ${province.name}`)
  } catch (error) {
    sendError(res, 'Terjadi kesalahan server', 500, error)
  }
}

// ===================== END : PROVINCE ========================

// ===================== START : CITY ==========================
/**
 * GET /cities
 * Query: ?search=bandung&province_id=uuid&type=KOTA&page=1&limit=20
 */
export const getAllCities = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, province_id, type, page, limit } = req.query

    if (type) {
      const typeUpper = (type as string).toUpperCase()
      if (!Object.values(CityType).includes(typeUpper as CityType)) {
        sendBadRequest(res, "Parameter 'type' harus KABUPATEN atau KOTA")
        return
      }
    }

    const parsedPage = page ? Number(page) : undefined
    const parsedLimit = limit ? Number(limit) : undefined

    if (parsedPage !== undefined && (isNaN(parsedPage) || parsedPage < 1)) {
      sendBadRequest(res, "Parameter 'page' harus berupa angka positif")
      return
    }
    if (parsedLimit !== undefined && (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100)) {
      sendBadRequest(res, "Parameter 'limit' harus antara 1 dan 100")
      return
    }

    const params: CityQueryParams = {
      search: search as string | undefined,
      province_id: province_id as string | undefined,
      type: type ? ((type as string).toUpperCase() as CityType) : undefined,
      page: parsedPage,
      limit: parsedLimit
    }

    const result = await findAllCities(params)
    sendSuccess(res, result.data, 'Berhasil mengambil data kota/kabupaten', 200, result.meta)
  } catch (error) {
    sendError(res, 'Terjadi kesalahan server', 500, error)
  }
}

/**
 * GET /cities/:id
 * Mendukung UUID maupun kode Kemendagri (contoh: "32.01")
 */
export const getOneCity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    // Deteksi apakah UUID atau kode Kemendagri
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    const city = isUuid
      ? await findByIdCityWithProvince(id)
      : await (async () => {
          const c = await findByCodeCity(id)
          if (!c) return null
          return findByIdCityWithProvince(c.id)
        })()

    if (!city) {
      sendNotFound(res, 'Kota/Kabupaten')
      return
    }

    sendSuccess(res, city, 'Berhasil mengambil data kota/kabupaten')
  } catch (error) {
    sendError(res, 'Terjadi kesalahan server', 500, error)
  }
}

// ===================== END : CITY ============================
