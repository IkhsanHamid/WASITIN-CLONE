// ─── Enums ────────────────────────────────────────────────────────────────────

export enum CityType {
  KABUPATEN = 'KABUPATEN',
  KOTA = 'KOTA'
}

// ─── Entity Types ─────────────────────────────────────────────────────────────

export interface Province {
  id: string
  code: string
  name: string
  created_at: Date
  updated_at: Date
}

export interface City {
  id: string
  province_id: string
  code: string
  name: string
  type: CityType
  created_at: Date
  updated_at: Date
}

export interface CityWithProvince extends City {
  province: Province
}

export interface ProvinceWithCities extends Province {
  cities: City[]
}

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface ProvinceQueryParams {
  search?: string
  page?: number
  limit?: number
}

export interface CityQueryParams {
  search?: string
  province_id?: string
  type?: CityType
  page?: number
  limit?: number
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface PaginatedResult<T> {
  data: T[]
  meta: PaginationMeta
}
