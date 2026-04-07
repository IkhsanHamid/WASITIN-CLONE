import { Router } from 'express'
// import { createSession, destroySession, refreshSession, register } from '../controllers/auth.controller'
import rateLimiter from '../middleware/rate-limiter'

export const authRouter: Router = Router()

// authRouter.post('/register', register)
// authRouter.post('/login', rateLimiter, createSession)
// // authRouter.post('/refreshToken', refreshSession)
// authRouter.put('/logout', destroySession)
