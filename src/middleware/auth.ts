import { type Request, type Response, type NextFunction } from 'express'
import { findAccessToken } from '../services/auth.service'
import utils from '../utils/utils'

export const requireUser = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.locals
  if (!user) {
    return res.status(403).json({ status: false, statusCode: 403, message: 'Unauthorized' })
  }
  const userId = utils.decryptWithSecret(user.code)
  const checkDB = await findAccessToken(userId)
  if (!checkDB) {
    return res.status(403).json({ status: false, statusCode: 403, message: 'Unauthorized' })
  }

  return next()
}
