import { Prisma } from '@prisma/client'
import prisma from '../config/prisma'
import {
  type Bank,
  type BankCreatePayload,
  type BankQueryParams,
  type BankUpdatePayload,
  type PaginatedResult,
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
  const { search, page = 1, limit = 100 } = params
  const skip = (page - 1) * limit

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
    prisma.md_banks.findMany({ where, orderBy: { name: 'asc' }, skip, take: limit })
  ])

  const total_pages = Math.ceil(total / limit)

  return {
    data: data as Bank[],
    meta: { total, page, limit, total_pages, has_next: page < total_pages, has_prev: page > 1 }
  }
}

export const findBankById = async (id: string): Promise<Bank | null> => {
  const bank = await prisma.md_banks.findUnique({ where: { id } })
  return bank as Bank | null
}

export const createBank = async (payload: BankCreatePayload, userId: string): Promise<Bank> => {
  const bank = await prisma.md_banks.create({
    data: {
      name: payload.name,
      code: payload.code,
      created_id: userId,
      created_at: new Date(),
      updated_at: new Date()
    }
  })
  return bank as Bank
}

export const updateBank = async (id: string, payload: BankUpdatePayload): Promise<Bank | null> => {
  const existing = await prisma.md_banks.findUnique({ where: { id } })
  if (!existing) return null

  const bank = await prisma.md_banks.update({
    where: { id },
    data: {
      name: payload.name ?? existing.name,
      code: payload.code ?? existing.code,
      updated_at: new Date()
    }
  })
  return bank as Bank
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
