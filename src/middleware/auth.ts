import { type Request, type Response, type NextFunction } from 'express'
import { findAccessToken } from '../services/auth.service'

export const requireUser = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.locals

  if (!user?.sub) {
    return res.status(401).json({ status: false, statusCode: 401, message: 'Unauthorized' })
  }

  // Validasi token masih ada di DB (cegah akses setelah logout)
  const dbToken = await findAccessToken(user.sub)
  if (!dbToken) {
    return res.status(401).json({ status: false, statusCode: 401, message: 'Session not found, please login again' })
  }

  return next()
}

const ADMIN_ROLES = ['admin', 'superadmin', 'owner']

export const requiredAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.locals

  if (!user?.sub) {
    return res.status(401).json({ status: false, statusCode: 401, message: 'Unauthorized' })
  }

  const dbToken = await findAccessToken(user.sub)
  if (!dbToken) {
    return res.status(401).json({ status: false, statusCode: 401, message: 'Session not found, please login again' })
  }

  if (!ADMIN_ROLES.includes(user.role)) {
    return res.status(403).json({ status: false, statusCode: 403, message: 'Forbidden: insufficient role' })
  }

  return next()
}
