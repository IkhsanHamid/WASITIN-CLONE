import { Router } from 'express'
import {
  createBankData,
  createSportData,
  createVoucherData,
  deleteBankData,
  deleteSportData,
  deleteVoucherData,
  getAllBanks,
  getAllSports,
  getAllVouchers,
  getBankById,
  getSportById,
  getVoucherById,
  updateBankData,
  updateSportData,
  updateVoucherData
} from '../controllers/master.controller'
import { requiredAdmin } from '../middleware/auth'

export const masterRouter: Router = Router()

// ─── Sport ────────────────────────────────────────────────────────────────────
masterRouter.get('/sports', getAllSports)
masterRouter.get('/sports/:id', getSportById)
masterRouter.post('/sports', requiredAdmin, createSportData)
masterRouter.put('/sports/:id', requiredAdmin, updateSportData)
masterRouter.delete('/sports/:id', requiredAdmin, deleteSportData)

// ─── Bank ─────────────────────────────────────────────────────────────────────
masterRouter.get('/banks', getAllBanks)
masterRouter.get('/banks/:id', getBankById)
masterRouter.post('/banks', requiredAdmin, createBankData)
masterRouter.put('/banks/:id', requiredAdmin, updateBankData)
masterRouter.delete('/banks/:id', requiredAdmin, deleteBankData)

// ─── Voucher ──────────────────────────────────────────────────────────────────
masterRouter.get('/vouchers', getAllVouchers)
masterRouter.get('/vouchers/:id', getVoucherById)
masterRouter.post('/vouchers', requiredAdmin, createVoucherData)
masterRouter.put('/vouchers/:id', requiredAdmin, updateVoucherData)
masterRouter.delete('/vouchers/:id', requiredAdmin, deleteVoucherData)
