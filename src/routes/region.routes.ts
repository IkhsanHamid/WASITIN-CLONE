import { Router } from 'express'
import {
  getAllCities,
  getAllProvinces,
  getCityByProvince,
  getOneCity,
  getOneProvince
} from '../controllers/region.controller'

// ─── Province Routes ──────────────────────────────────────────────────────────

export const regionRouter: Router = Router()

/**
 * GET /provinces
 * Daftar semua provinsi
 * Query: ?search=jawa&page=1&limit=10
 */
regionRouter.get('/provinces', getAllProvinces)

/**
 * GET /provinces/:id
 * Detail satu provinsi
 * :id bisa UUID atau kode Kemendagri (contoh: "32")
 */
regionRouter.get('/provinces/:id', getOneProvince)

/**
 * GET /provinces/:id/cities
 * Semua kota/kabupaten dalam satu provinsi
 * Query: ?type=KABUPATEN|KOTA
 */
regionRouter.get('/provinces/:id/cities', getCityByProvince)

// ─── City Routes ──────────────────────────────────────────────────────────────

/**
 * GET /cities
 * Daftar semua kota/kabupaten
 * Query: ?search=bandung&province_id=uuid&type=KOTA&page=1&limit=20
 */
regionRouter.get('/cities', getAllCities)

/**
 * GET /cities/:id
 * Detail satu kota/kabupaten (include data provinsi)
 * :id bisa UUID atau kode Kemendagri (contoh: "32.01")
 */
regionRouter.get('/cities/:id', getOneCity)
