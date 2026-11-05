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
  updateVoucherData,
  getAllServiceFees,
  getMyServiceFee,
  getServiceFeeById,
  createServiceFeeData,
  updateServiceFeeData,
  deleteServiceFeeData,
  activateServiceFeeData
} from '../controllers/master.controller'
import { requiredAdmin, requireUser } from '../middleware/auth'
import upload from '../middleware/multer'

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
masterRouter.post('/banks', requiredAdmin, upload.single('photo'), createBankData)
masterRouter.put('/banks/:id', requiredAdmin, upload.single('photo'), updateBankData)
masterRouter.delete('/banks/:id', requiredAdmin, deleteBankData)

// ─── Voucher ──────────────────────────────────────────────────────────────────
masterRouter.get('/vouchers', getAllVouchers)
masterRouter.get('/vouchers/:id', getVoucherById)
masterRouter.post('/vouchers', requiredAdmin, createVoucherData)
masterRouter.put('/vouchers/:id', requiredAdmin, updateVoucherData)
masterRouter.delete('/vouchers/:id', requiredAdmin, deleteVoucherData)

// ─── Service Fees ──────────────────────────────────────────────────────────────
masterRouter.get('/service-fees', requiredAdmin, getAllServiceFees)
masterRouter.get('/service-fees/me', requireUser, getMyServiceFee)
masterRouter.get('/service-fees/:id', requiredAdmin, getServiceFeeById)
masterRouter.post('/service-fees', requiredAdmin, createServiceFeeData)
masterRouter.put('/service-fees/:id', requiredAdmin, updateServiceFeeData)
masterRouter.delete('/service-fees/:id', requiredAdmin, deleteServiceFeeData)
masterRouter.patch('/service-fees/:id/activate', requiredAdmin, activateServiceFeeData)
