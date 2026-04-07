import { type Request, type Response, type NextFunction } from 'express'
import { logger } from '../config/logger'

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`ERR: ${req.method} ${req.url} - ${err.message}`)

  res.status(err.statusCode || 500).json({
    status: false,
    statusCode: err.statusCode || 500,
    message: err.message || 'Internal Server Error'
  })
}
