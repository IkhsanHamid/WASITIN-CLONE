import express, { type Request, type Response } from 'express'
import rateLimit from 'express-rate-limit'

const app = express()

const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 menit
  max: 1000, // Maksimum 3 request per IP dalam 1 menit
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      statusCode: 429,
      error: 'Too Many Requests',
      message: 'You have exceeded the request limit. Please try again later.'
    })
  }
})
export default rateLimiter
