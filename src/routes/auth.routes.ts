import { Router } from 'express'
import {
  googleAuth,
  refreshToken,
  logout,
  getMe,
  registerReferee,
  loginAdmin,
  loginReferee,
  forgotPasswordSendOTP,
  forgotPasswordVerifyOTP,
  forgotPasswordReset,
  resubmitRefereeData,
  checkActiveResubmit
} from '../controllers/auth.controller'
import rateLimiter from '../middleware/rate-limiter'
import upload from '../middleware/multer'

export const authRouter: Router = Router()

authRouter.post('/google', rateLimiter, googleAuth) // Login/Register via Google
authRouter.post('/refresh', refreshToken) // Rotate token
authRouter.post('/logout', logout) // Logout
authRouter.get('/me', getMe)
authRouter.post('/admin/login', rateLimiter, loginAdmin) // Admin login
authRouter.post('/referee/login', rateLimiter, loginReferee) // Referee login
authRouter.post('/forgot-password/send-otp', rateLimiter, forgotPasswordSendOTP) // Send OTP
authRouter.post('/forgot-password/verify-otp', rateLimiter, forgotPasswordVerifyOTP) // Verify OTP
authRouter.post('/forgot-password/reset', rateLimiter, forgotPasswordReset) // Reset password
authRouter.post(
  '/referee/register',
  upload.fields([
    { name: 'photoProfile', maxCount: 1 },
    { name: 'photos', maxCount: 2 },
    { name: 'license1', maxCount: 1 },
    { name: 'license2', maxCount: 1 },
    { name: 'license3', maxCount: 1 },
    { name: 'license4', maxCount: 1 },
    { name: 'license5', maxCount: 1 }
  ]),
  registerReferee
)
authRouter.post(
  '/referee/resubmit',
  upload.fields([
    { name: 'license1', maxCount: 1 },
    { name: 'license2', maxCount: 1 },
    { name: 'license3', maxCount: 1 },
    { name: 'license4', maxCount: 1 },
    { name: 'license5', maxCount: 1 }
  ]),
  resubmitRefereeData
)
authRouter.post('/referee/check-resubmit', checkActiveResubmit) // Cek apakah referee perlu resubmit data untuk verifikasi ulang
