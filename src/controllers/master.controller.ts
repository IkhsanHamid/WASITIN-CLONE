import { type Request, type Response } from 'express'
import {
  createBank,
  createSport,
  createVoucher,
  deleteBank,
  deleteSport,
  deleteVoucher,
  findAllBanks,
  findAllSports,
  findAllVouchers,
  findBankById,
  findSportById,
  findVoucherById,
  updateBank,
  updateSport,
  updateVoucher,
  findAllServiceFees,
  findServiceFeeById,
  createServiceFee,
  updateServiceFee,
  deleteServiceFee,
  activateServiceFee,
  getActiveServiceFee
} from '../services/master.service'
import { sendBadRequest, sendError, sendNotFound, sendSuccess } from '../utils/response.helper'
import { uploadImage } from '../services/upload.service'
import type { BankCreatePayload, BankUpdatePayload, SportCreatePayload, SportUpdatePayload, VoucherCreatePayload, VoucherUpdatePayload, ServiceFeeCreatePayload, ServiceFeeUpdatePayload } from '../types/master.type'

// =============================================================================
// SPORT
// =============================================================================

export const getAllSports = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, page, limit } = req.query
    const parsedPage = page ? Number(page) : undefined
    const parsedLimit = limit ? Number(limit) : undefined

    if (parsedPage !== undefined && (isNaN(parsedPage) || parsedPage < 1)) {
      return void sendBadRequest(res, "Parameter 'page' harus berupa angka positif")
    }
    if (parsedLimit !== undefined && (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100)) {
      return void sendBadRequest(res, "Parameter 'limit' harus antara 1 dan 100")
    }

    const result = await findAllSports({ search: search as string, page: parsedPage, limit: parsedLimit })
    sendSuccess(res, result.data, 'Berhasil mengambil data olahraga', 200, result.meta)
  } catch (error) {
    sendError(res, 'Terjadi kesalahan server', 500, error)
  }
}

export const getSportById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const sport = await findSportById(id)
    if (!sport) {
      return void sendNotFound(res, 'Olahraga')
    }
    sendSuccess(res, sport, 'Berhasil mengambil data olahraga')
  } catch (error) {
    sendError(res, 'Terjadi kesalahan server', 500, error)
  }
}

export const createSportData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body as SportCreatePayload
    if (!name || typeof name !== 'string' || !name.trim()) {
      return void sendBadRequest(res, 'Nama olahraga wajib diisi')
    }
    const sport = await createSport({ name: name.trim() })
    sendSuccess(res, sport, 'Berhasil menambah olahraga', 201)
  } catch (error) {
    sendError(res, 'Terjadi kesalahan server', 500, error)
  }
}

export const updateSportData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { name } = req.body as SportUpdatePayload
    if (!name || typeof name !== 'string' || !name.trim()) {
      return void sendBadRequest(res, 'Nama olahraga wajib diisi')
    }
    const sport = await updateSport(id, { name: name.trim() })
    if (!sport) {
      return void sendNotFound(res, 'Olahraga')
    }
    sendSuccess(res, sport, 'Berhasil mengupdate olahraga')
  } catch (error) {
    sendError(res, 'Terjadi kesalahan server', 500, error)
  }
}

export const deleteSportData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const deleted = await deleteSport(id)
    if (!deleted) {
      return void sendNotFound(res, 'Olahraga')
    }
    sendSuccess(res, null, 'Berhasil menghapus olahraga')
  } catch (error) {
    sendError(res, 'Terjadi kesalahan server', 500, error)
  }
}

// =============================================================================
// BANK
// =============================================================================

export const getAllBanks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, page, limit } = req.query
    const parsedPage = page ? Number(page) : undefined
    const parsedLimit = limit ? Number(limit) : undefined

    if (parsedPage !== undefined && (isNaN(parsedPage) || parsedPage < 1)) {
      return void sendBadRequest(res, "Parameter 'page' harus berupa angka positif")
    }
    if (parsedLimit !== undefined && (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100)) {
      return void sendBadRequest(res, "Parameter 'limit' harus antara 1 dan 100")
    }

    const result = await findAllBanks({ search: search as string, page: parsedPage, limit: parsedLimit })
    sendSuccess(res, result.data, 'Berhasil mengambil data bank', 200, result.meta)
  } catch (error) {
    sendError(res, 'Terjadi kesalahan server', 500, error)
  }
}

export const getBankById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const bank = await findBankById(id)
    if (!bank) {
      return void sendNotFound(res, 'Bank')
    }
    sendSuccess(res, bank, 'Berhasil mengambil data bank')
  } catch (error) {
    sendError(res, 'Terjadi kesalahan server', 500, error)
  }
}

export const createBankData = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file
    const { name, code } = req.body as BankCreatePayload
    if (!name || typeof name !== 'string' || !name.trim()) {
      return void sendBadRequest(res, 'Nama bank wajib diisi')
    }
    if (!code || typeof code !== 'string' || !code.trim()) {
      return void sendBadRequest(res, 'Kode bank wajib diisi')
    }
    const userId = req.locals?.sub
    if (!userId) {
      return void sendBadRequest(res, 'Unauthorized')
    }
    let photo = ''
    if (file) {
      photo = await uploadImage(file)
    }
    const bank = await createBank({ name: name.trim(), code: code.trim(), photo }, userId)
    sendSuccess(res, bank, 'Berhasil menambah bank', 201)
  } catch (error: any) {
    sendError(res, error.message || 'Terjadi kesalahan server', 500)
  }
}

export const updateBankData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const file = req.file
    const { name, code } = req.body as BankUpdatePayload
    if (!name || typeof name !== 'string' || !name.trim()) {
      return void sendBadRequest(res, 'Nama bank wajib diisi')
    }
    if (!code || typeof code !== 'string' || !code.trim()) {
      return void sendBadRequest(res, 'Kode bank wajib diisi')
    }
    let photo: string | undefined
    if (file) {
      photo = await uploadImage(file)
    }
    const bank = await updateBank(id, { name: name.trim(), code: code.trim(), photo })
    if (!bank) {
      return void sendNotFound(res, 'Bank')
    }
    sendSuccess(res, bank, 'Berhasil mengupdate bank')
  } catch (error: any) {
    sendError(res, error.message || 'Terjadi kesalahan server', 500)
  }
}

export const deleteBankData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const deleted = await deleteBank(id)
    if (!deleted) {
      return void sendNotFound(res, 'Bank')
    }
    sendSuccess(res, null, 'Berhasil menghapus bank')
  } catch (error) {
    sendError(res, 'Terjadi kesalahan server', 500, error)
  }
}

// =============================================================================
// VOUCHER
// =============================================================================

export const getAllVouchers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, page, limit } = req.query
    const parsedPage = page ? Number(page) : undefined
    const parsedLimit = limit ? Number(limit) : undefined

    if (parsedPage !== undefined && (isNaN(parsedPage) || parsedPage < 1)) {
      return void sendBadRequest(res, "Parameter 'page' harus berupa angka positif")
    }
    if (parsedLimit !== undefined && (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100)) {
      return void sendBadRequest(res, "Parameter 'limit' harus antara 1 dan 100")
    }

    const result = await findAllVouchers({ search: search as string, page: parsedPage, limit: parsedLimit })
    sendSuccess(res, result.data, 'Berhasil mengambil data voucher', 200, result.meta)
  } catch (error) {
    sendError(res, 'Terjadi kesalahan server', 500, error)
  }
}

export const getVoucherById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const voucher = await findVoucherById(id)
    if (!voucher) {
      return void sendNotFound(res, 'Voucher')
    }
    sendSuccess(res, voucher, 'Berhasil mengambil data voucher')
  } catch (error) {
    sendError(res, 'Terjadi kesalahan server', 500, error)
  }
}

export const createVoucherData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, type, amount } = req.body as VoucherCreatePayload
    if (!name || typeof name !== 'string' || !name.trim()) {
      return void sendBadRequest(res, 'Nama voucher wajib diisi')
    }
    if (!type || typeof type !== 'string' || !type.trim()) {
      return void sendBadRequest(res, 'Tipe voucher wajib diisi')
    }
    if (amount === undefined || amount === null || typeof amount !== 'number' || amount < 0) {
      return void sendBadRequest(res, 'Jumlah voucher wajib diisi dan harus angka positif')
    }
    const userId = req.locals?.sub
    if (!userId) {
      return void sendBadRequest(res, 'Unauthorized')
    }
    const voucher = await createVoucher({ name: name.trim(), type: type.trim(), amount }, userId)
    sendSuccess(res, voucher, 'Berhasil menambah voucher', 201)
  } catch (error) {
    sendError(res, 'Terjadi kesalahan server', 500, error)
  }
}

export const updateVoucherData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { name, type, amount } = req.body as VoucherUpdatePayload
    if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
      return void sendBadRequest(res, 'Nama voucher tidak valid')
    }
    if (type !== undefined && (typeof type !== 'string' || !type.trim())) {
      return void sendBadRequest(res, 'Tipe voucher tidak valid')
    }
    if (amount !== undefined && (typeof amount !== 'number' || amount < 0)) {
      return void sendBadRequest(res, 'Jumlah voucher harus angka positif')
    }
    const userId = req.locals?.sub
    if (!userId) {
      return void sendBadRequest(res, 'Unauthorized')
    }
    const voucher = await updateVoucher(
      id,
      {
        name: name?.trim(),
        type: type?.trim(),
        amount
      },
      userId
    )
    if (!voucher) {
      return void sendNotFound(res, 'Voucher')
    }
    sendSuccess(res, voucher, 'Berhasil mengupdate voucher')
  } catch (error) {
    sendError(res, 'Terjadi kesalahan server', 500, error)
  }
}

export const deleteVoucherData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const deleted = await deleteVoucher(id)
    if (!deleted) {
      return void sendNotFound(res, 'Voucher')
    }
    sendSuccess(res, null, 'Berhasil menghapus voucher')
  } catch (error) {
    sendError(res, 'Terjadi kesalahan server', 500, error)
  }
}

// =============================================================================
// SERVICE FEES
// =============================================================================

export const getAllServiceFees = async (req: Request, res: Response): Promise<void> => {
  try {
    const fees = await findAllServiceFees()
    sendSuccess(res, fees, 'Berhasil mengambil data biaya layanan')
  } catch (error) {
    sendError(res, 'Terjadi kesalahan server', 500, error)
  }
}

export const getMyServiceFee = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.locals
    const role = user?.role

    if (role === 'member') {
      const fee = await getActiveServiceFee('booking')
      sendSuccess(res, fee, 'success')
      return
    }

    if (role === 'referee') {
      const fee = await getActiveServiceFee('withdraw')
      sendSuccess(res, fee, 'success')
      return
    }

    sendError(res, 'Akses ditolak', 403)
  } catch (error) {
    sendError(res, 'Terjadi kesalahan server', 500, error)
  }
}

export const getServiceFeeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const fee = await findServiceFeeById(id)
    if (!fee) {
      return void sendNotFound(res, 'Biaya Layanan')
    }
    sendSuccess(res, fee, 'Berhasil mengambil data biaya layanan')
  } catch (error) {
    sendError(res, 'Terjadi kesalahan server', 500, error)
  }
}

export const createServiceFeeData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, type, percentage, amount, type_service } = req.body as ServiceFeeCreatePayload
    if (!name || typeof name !== 'string' || !name.trim()) {
      return void sendBadRequest(res, 'Nama biaya layanan wajib diisi')
    }
    if (!type || !['percentage', 'fixed'].includes(type)) {
      return void sendBadRequest(res, 'Tipe harus percentage atau fixed')
    }
    if (!type_service || typeof type_service !== 'string' || !type_service.trim()) {
      return void sendBadRequest(res, 'Tipe layanan wajib diisi')
    }
    if (type === 'percentage' && (percentage === undefined || percentage === null || Number(percentage) < 0)) {
      return void sendBadRequest(res, 'Persentase wajib diisi untuk tipe percentage')
    }
    if (type === 'fixed' && (amount === undefined || amount === null || Number(amount) < 0)) {
      return void sendBadRequest(res, 'Jumlah wajib diisi untuk tipe fixed')
    }

    const fee = await createServiceFee({
      name: name.trim(),
      type,
      percentage: type === 'percentage' ? Number(percentage) : undefined,
      amount: type === 'fixed' ? Number(amount) : undefined,
      type_service: type_service.trim()
    })
    sendSuccess(res, fee, 'Berhasil menambah biaya layanan', 201)
  } catch (error) {
    sendError(res, 'Terjadi kesalahan server', 500, error)
  }
}

export const updateServiceFeeData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { name, type, percentage, amount, type_service } = req.body as ServiceFeeUpdatePayload
    const updateData: any = {}
    if (name && typeof name === 'string' && name.trim()) updateData.name = name.trim()
    if (type) updateData.type = type
    if (percentage !== undefined && percentage !== null && Number(percentage) >= 0) updateData.percentage = Number(percentage)
    if (amount !== undefined && amount !== null && Number(amount) >= 0) updateData.amount = Number(amount)
    if (type_service && typeof type_service === 'string' && type_service.trim()) updateData.type_service = type_service.trim()

    const fee = await updateServiceFee(id, updateData)
    if (!fee) {
      return void sendNotFound(res, 'Biaya Layanan')
    }
    sendSuccess(res, fee, 'Berhasil mengupdate biaya layanan')
  } catch (error) {
    sendError(res, 'Terjadi kesalahan server', 500, error)
  }
}

export const deleteServiceFeeData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const deleted = await deleteServiceFee(id)
    if (!deleted) {
      return void sendNotFound(res, 'Biaya Layanan')
    }
    sendSuccess(res, null, 'Berhasil menghapus biaya layanan')
  } catch (error) {
    sendError(res, 'Terjadi kesalahan server', 500, error)
  }
}

export const activateServiceFeeData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const fee = await activateServiceFee(id)
    if (!fee) {
      return void sendNotFound(res, 'Biaya Layanan')
    }
    sendSuccess(res, fee, 'Biaya layanan berhasil diaktifkan')
  } catch (error) {
    sendError(res, 'Terjadi kesalahan server', 500, error)
  }
}
