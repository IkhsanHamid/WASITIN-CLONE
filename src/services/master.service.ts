import { Prisma } from '@prisma/client'
import prisma from '../config/prisma'
import {
  type Bank,
  type BankCreatePayload,
  type BankQueryParams,
  type BankUpdatePayload,
  type PaginatedResult,
  type ServiceFee,
  type ServiceFeeCreatePayload,
  type ServiceFeeUpdatePayload,
  type Sport,
  type SportCreatePayload,
  type SportQueryParams,
  type SportUpdatePayload,
  type Voucher,
  type VoucherCreatePayload,
  type VoucherQueryParams,
  type VoucherUpdatePayload
} from '../types/master.type'
import { logger } from '../config/logger'

// =============================================================================
// SPORT
// =============================================================================

export const findAllSports = async (params: SportQueryParams = {}): Promise<PaginatedResult<Sport>> => {
  const { search, page = 1, limit = 100 } = params
  const skip = (page - 1) * limit

  const where: Prisma.md_sportsWhereInput = search
    ? { name: { contains: search, mode: 'insensitive' } }
    : {}

  const [total, data] = await Promise.all([
    prisma.md_sports.count({ where }),
    prisma.md_sports.findMany({ where, orderBy: { name: 'asc' }, skip, take: limit })
  ])

  const total_pages = Math.ceil(total / limit)

  return {
    data: data as Sport[],
    meta: { total, page, limit, total_pages, has_next: page < total_pages, has_prev: page > 1 }
  }
}

export const findSportById = async (id: string): Promise<Sport | null> => {
  const sport = await prisma.md_sports.findUnique({ where: { id } })
  return sport as Sport | null
}

export const createSport = async (payload: SportCreatePayload): Promise<Sport> => {
  const sport = await prisma.md_sports.create({ data: { name: payload.name } })
  return sport as Sport
}

export const updateSport = async (id: string, payload: SportUpdatePayload): Promise<Sport | null> => {
  const existing = await prisma.md_sports.findUnique({ where: { id } })
  if (!existing) return null

  const sport = await prisma.md_sports.update({
    where: { id },
    data: { name: payload.name ?? existing.name }
  })
  return sport as Sport
}

export const deleteSport = async (id: string): Promise<boolean> => {
  const existing = await prisma.md_sports.findUnique({ where: { id } })
  if (!existing) return false

  await prisma.md_sports.delete({ where: { id } })
  return true
}

// =============================================================================
// BANK
// =============================================================================

export const findAllBanks = async (params: BankQueryParams = {}): Promise<PaginatedResult<Bank>> => {
  const { search, page, limit } = params

  const where: Prisma.md_banksWhereInput = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } }
        ]
      }
    : {}

  const [total, data] = await Promise.all([
    prisma.md_banks.count({ where }),
    page && limit
      ? prisma.md_banks.findMany({ where, orderBy: { name: 'asc' }, skip: (page - 1) * limit, take: limit })
      : prisma.md_banks.findMany({ where, orderBy: { name: 'asc' } })
  ])

  const effectivePage = page ?? 1
  const effectiveLimit = limit ?? total
  const total_pages = Math.ceil(total / effectiveLimit)

  return {
    data: data as Bank[],
    meta: { total, page: effectivePage, limit: effectiveLimit, total_pages, has_next: effectivePage < total_pages, has_prev: effectivePage > 1 }
  }
}

export const findBankById = async (id: string): Promise<Bank | null> => {
  const bank = await prisma.md_banks.findUnique({ where: { id } })
  return bank as Bank | null
}

export const createBank = async (payload: BankCreatePayload, userId: string): Promise<Bank> => {
  try {
    const bank = await prisma.md_banks.create({
      data: {
        name: payload.name,
        code: payload.code,
        photo: payload.photo ?? '',
        created_id: userId,
        created_at: new Date(),
        updated_at: new Date()
      }
    })
    return bank as Bank
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error('Kode bank sudah digunakan')
    }
    throw error
  }
}

export const updateBank = async (id: string, payload: BankUpdatePayload): Promise<Bank | null> => {
  const existing = await prisma.md_banks.findUnique({ where: { id } })
  if (!existing) return null

  try {
    const bank = await prisma.md_banks.update({
      where: { id },
      data: {
        name: payload.name ?? existing.name,
        code: payload.code ?? existing.code,
        photo: payload.photo !== undefined ? payload.photo : existing.photo,
        updated_at: new Date()
      }
    })
    return bank as Bank
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error('Kode bank sudah digunakan')
    }
    throw error
  }
}

export const deleteBank = async (id: string): Promise<boolean> => {
  const existing = await prisma.md_banks.findUnique({ where: { id } })
  if (!existing) return false

  await prisma.md_banks.delete({ where: { id } })
  return true
}

// =============================================================================
// VOUCHER
// =============================================================================

export const findAllVouchers = async (params: VoucherQueryParams = {}): Promise<PaginatedResult<Voucher>> => {
  const { search, page = 1, limit = 100 } = params
  const skip = (page - 1) * limit

  const where: Prisma.md_voucherWhereInput = search
    ? { name: { contains: search, mode: 'insensitive' } }
    : {}

  const [total, data] = await Promise.all([
    prisma.md_voucher.count({ where }),
    prisma.md_voucher.findMany({ where, orderBy: { name: 'asc' }, skip, take: limit })
  ])

  const total_pages = Math.ceil(total / limit)

  return {
    data: data as Voucher[],
    meta: { total, page, limit, total_pages, has_next: page < total_pages, has_prev: page > 1 }
  }
}

export const findVoucherById = async (id: string): Promise<Voucher | null> => {
  const voucher = await prisma.md_voucher.findUnique({ where: { id } })
  return voucher as Voucher | null
}

export const createVoucher = async (payload: VoucherCreatePayload, userId: string): Promise<Voucher> => {
  const voucher = await prisma.md_voucher.create({
    data: {
      name: payload.name,
      type: payload.type,
      amount: payload.amount,
      created_id: userId,
      created_at: new Date(),
      updated_at: new Date()
    }
  })
  return voucher as Voucher
}

export const updateVoucher = async (id: string, payload: VoucherUpdatePayload, userId: string): Promise<Voucher | null> => {
  const existing = await prisma.md_voucher.findUnique({ where: { id } })
  if (!existing) return null

  const voucher = await prisma.md_voucher.update({
    where: { id },
    data: {
      name: payload.name ?? existing.name,
      type: payload.type ?? existing.type,
      amount: payload.amount ?? existing.amount,
      updated_id: userId,
      updated_at: new Date()
    }
  })
  return voucher as Voucher
}

export const deleteVoucher = async (id: string): Promise<boolean> => {
  const existing = await prisma.md_voucher.findUnique({ where: { id } })
  if (!existing) return false

  await prisma.md_voucher.delete({ where: { id } })
  return true
}

// =============================================================================
// SERVICE FEES
// =============================================================================

export const findAllServiceFees = async (): Promise<ServiceFee[]> => {
  const fees = await prisma.service_fees.findMany({
    orderBy: { created_at: 'desc' }
  })
  return fees as unknown as ServiceFee[]
}

export const findServiceFeeById = async (id: string): Promise<ServiceFee | null> => {
  const fee = await prisma.service_fees.findUnique({ where: { id } })
  return fee as unknown as ServiceFee | null
}

export const createServiceFee = async (payload: ServiceFeeCreatePayload): Promise<ServiceFee> => {
  const fee = await prisma.service_fees.create({
    data: {
      name: payload.name,
      type: payload.type,
      type_service: payload.type_service,
      percentage: payload.type === 'percentage' ? (payload.percentage ?? 0) : null,
      amount: payload.type === 'fixed' ? (payload.amount ?? 0) : null,
      is_active: false,
      created_at: new Date(),
      updated_at: new Date()
    }
  })
  return fee as unknown as ServiceFee
}

export const updateServiceFee = async (id: string, payload: ServiceFeeUpdatePayload): Promise<ServiceFee | null> => {
  const existing = await prisma.service_fees.findUnique({ where: { id } })
  if (!existing) return null

  const fee = await prisma.service_fees.update({
    where: { id },
    data: {
      name: payload.name ?? existing.name,
      type: payload.type ?? existing.type,
      type_service: payload.type_service ?? existing.type_service,
      percentage: payload.percentage !== undefined ? payload.percentage : existing.percentage,
      amount: payload.amount !== undefined ? payload.amount : existing.amount,
      updated_at: new Date()
    }
  })
  return fee as unknown as ServiceFee
}

export const deleteServiceFee = async (id: string): Promise<boolean> => {
  const existing = await prisma.service_fees.findUnique({ where: { id } })
  if (!existing) return false

  await prisma.service_fees.delete({ where: { id } })
  return true
}

export const activateServiceFee = async (id: string): Promise<ServiceFee | null> => {
  const existing = await prisma.service_fees.findUnique({ where: { id } })
  if (!existing) return null

  await prisma.service_fees.updateMany({
    where: { is_active: true, type_service: existing.type_service },
    data: { is_active: false }
  })

  const fee = await prisma.service_fees.update({
    where: { id },
    data: { is_active: true, updated_at: new Date() }
  })
  return fee as unknown as ServiceFee
}

export const getActiveServiceFee = async (typeService: string): Promise<ServiceFee | null> => {
  const fee = await prisma.service_fees.findFirst({
    where: { is_active: true, type_service: typeService }
  })
  return fee as unknown as ServiceFee | null
}
