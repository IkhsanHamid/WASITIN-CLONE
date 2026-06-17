import { Router } from 'express'
import { requiredAdmin, requireUser } from '../middleware/auth'
import { getReferees, getReferee, updateRefereeData, deleteRefereeData, verifyRefereeData, activateRefereeData, deactivateRefereeData, getProfile, updateProfile, getPricing, updatePricing, getLicensesData, getLicenseData, createLicenseData, updateLicenseData, deleteLicenseData, verifyLicenseData, getPublicReferees, getPublicReferee, getAvailability, updateAvailability, deleteAvailability, getPublicRefereeAvailabilityController, getRecommendedRefereesController } from '../controllers/referee.controller'
import upload from '../middleware/multer'

export const refereeRouter: Router = Router()

refereeRouter.get('/public', getPublicReferees)
refereeRouter.get('/public/:id', getPublicReferee)
refereeRouter.get('/public/:id/availability', getPublicRefereeAvailabilityController)
refereeRouter.get('/public/:id/recommendations', getRecommendedRefereesController)

refereeRouter.get('/', requiredAdmin, getReferees)
refereeRouter.get('/:id', requiredAdmin, getReferee)
refereeRouter.put('/:id', requiredAdmin, updateRefereeData)
refereeRouter.delete('/:id', requiredAdmin, deleteRefereeData)
refereeRouter.patch('/:id/verify', requiredAdmin, verifyRefereeData)
refereeRouter.patch('/:id/activate', requiredAdmin, activateRefereeData)
refereeRouter.patch('/:id/deactivate', requiredAdmin, deactivateRefereeData)

refereeRouter.get('/profile/me', requireUser, getProfile)
refereeRouter.put('/profile/me', requireUser, upload.fields([
  { name: 'photo_profile', maxCount: 1 },
  { name: 'photos', maxCount: 10 },
  { name: 'license_files', maxCount: 10 }
]), updateProfile)

refereeRouter.get('/pricing/me', requireUser, getPricing)
refereeRouter.put('/pricing/me', requireUser, updatePricing)

refereeRouter.get('/licenses/me', requireUser, getLicensesData)
refereeRouter.get('/licenses/me/:id', requireUser, getLicenseData)
refereeRouter.post('/licenses/me', requireUser, upload.single('file'), createLicenseData)
refereeRouter.put('/licenses/me/:id', requireUser, upload.single('file'), updateLicenseData)
refereeRouter.delete('/licenses/me/:id', requireUser, deleteLicenseData)

refereeRouter.patch('/licenses/:id/verify', requiredAdmin, verifyLicenseData)

refereeRouter.get('/availability/me', requireUser, getAvailability)
refereeRouter.put('/availability/me', requireUser, updateAvailability)
refereeRouter.delete('/availability/me/:id', requireUser, deleteAvailability)
