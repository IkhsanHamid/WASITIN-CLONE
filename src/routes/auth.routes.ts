import { Router } from 'express'
import { googleAuth, refreshToken, logout, getMe } from '../controllers/auth.controller'
import rateLimiter from '../middleware/rate-limiter'

export const authRouter: Router = Router()

authRouter.post('/google', rateLimiter, googleAuth) // Login/Register via Google
authRouter.post('/refresh', refreshToken) // Rotate token
authRouter.post('/logout', logout) // Logout
authRouter.get('/me', getMe)
