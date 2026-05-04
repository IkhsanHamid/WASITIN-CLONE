import { Prisma } from '@prisma/client'
import prisma from '../config/prisma'
import {
  City,
  CityQueryParams,
  CityType,
  CityWithProvince,
  PaginatedResult,
  Province,
  ProvinceQueryParams,
  ProvinceWithCities
} from '../types/region.type'

// ===================== START : PROVINCE ========================

export const findAllProvinces = async (params: ProvinceQueryParams = {}): Promise<PaginatedResult<Province>> => {
  const { search, page = 1, limit = 1000 } = params

  const skip = (page - 1) * limit

  const where: Prisma.md_provincesWhereInput = search
    ? {
        OR: [{ name: { contains: search, mode: 'insensitive' } }, { code: { contains: search, mode: 'insensitive' } }]
      }
    : {}

  const [total, data] = await Promise.all([
    prisma.md_provinces.count({ where }),
    prisma.md_provinces.findMany({
      where,
      orderBy: { code: 'asc' },
      skip,
      take: limit
    })
  ])

  const total_pages = Math.ceil(total / limit)

  return {
    data: data as Province[],
    meta: {
      total,
      page,
      limit,
      total_pages,
      has_next: page < total_pages,
      has_prev: page > 1
    }
  }
}

/**
 * Ambil satu provinsi berdasarkan ID (UUID)
 */

export const findByIdProvince = async (id: string): Promise<Province | null> => {
  const province = await prisma.md_provinces.findUnique({
    where: { id }
  })
  return province as Province | null
}

/**
 * Ambil satu provinsi berdasarkan kode Kemendagri (contoh: "32")
 */
export const findByCodeProvince = async (code: string): Promise<Province | null> => {
  const province = await prisma.md_provinces.findUnique({
    where: { code }
  })
  return province as Province | null
}

/**
 * Ambil provinsi beserta seluruh kota/kabupatennya
 */

export const findByIdProvinceWithCities = async (id: string): Promise<ProvinceWithCities | null> => {
  const province = await prisma.md_provinces.findUnique({
    where: { id },
    include: {
      md_cities: {
        orderBy: { code: 'asc' }
      }
    }
  })
  return province as ProvinceWithCities | null
}

/**
 * Ambil provinsi by code beserta seluruh kota/kabupatennya
 */
export const findByCodeProvinceWithCities = async (code: string): Promise<ProvinceWithCities | null> => {
  const province = await prisma.md_provinces.findUnique({
    where: { code },
    include: {
      md_cities: {
        orderBy: { code: 'asc' }
      }
    }
  })
  return province as ProvinceWithCities | null
}

// ===================== END : PROVINCE ========================

// ===================== START : CITY ==========================

export const findAllCities = async (params: CityQueryParams = {}): Promise<PaginatedResult<City>> => {
  const { search, province_id, type, page = 1, limit = 1000 } = params

  const skip = (page - 1) * limit

  const where: Prisma.md_citiesWhereInput = {}

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } }
    ]
  }

  if (province_id) {
    where.province_id = province_id
  }

  if (type) {
    where.type = type
  }

  const [total, data] = await Promise.all([
    prisma.md_cities.count({ where }),
    prisma.md_cities.findMany({
      where,
      orderBy: { code: 'asc' },
      skip,
      take: limit
    })
  ])

  const total_pages = Math.ceil(total / limit)

  return {
    data: data as City[],
    meta: {
      total,
      page,
      limit,
      total_pages,
      has_next: page < total_pages,
      has_prev: page > 1
    }
  }
}

/**
 * Ambil satu kota/kabupaten berdasarkan ID (UUID)
 */
export const findByIdCity = async (id: string): Promise<City | null> => {
  const city = await prisma.md_cities.findUnique({
    where: { id }
  })
  return city as City | null
}

/**
 * Ambil satu kota/kabupaten berdasarkan kode Kemendagri (contoh: "32.01")
 */
export const findByCodeCity = async (code: string): Promise<City | null> => {
  const city = await prisma.md_cities.findUnique({
    where: { code }
  })
  return city as City | null
}

/**
 * Ambil kota/kabupaten beserta data provinsinya
 */
export const findByIdCityWithProvince = async (id: string): Promise<CityWithProvince | null> => {
  const city = await prisma.md_cities.findUnique({
    where: { id },
    include: { md_provinces: true }
  })
  return city as CityWithProvince | null
}

/**
 * Ambil semua kota/kabupaten berdasarkan province_id
 */
export const findByProvinceId = async (province_id: string, type?: CityType): Promise<City[]> => {
  const where: Prisma.md_citiesWhereInput = { province_id }
  if (type) where.type = type

  const cities = await prisma.md_cities.findMany({
    where,
    orderBy: { code: 'asc' }
  })
  return cities as City[]
}

// ===================== END : CITY ============================
