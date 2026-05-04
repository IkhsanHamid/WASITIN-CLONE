import { type Request, type Response, type NextFunction } from 'express'
import { verifyAccessToken } from '../config/jwt'

const deserializedToken = (req: Request, res: Response, next: NextFunction) => {
  // ── DEV ONLY: mock user via header X-Mock-User ──────────────
  if (process.env.NODE_ENV === 'development' && req.headers['x-mock-user']) {
    req.locals = JSON.parse(req.headers['x-mock-user'] as string)
    return next()
  }
  // ── END DEV MOCK ─────────────────────────────────────────────

  // Prioritas: cookie > Authorization header (support keduanya)
  const tokenFromCookie = req.cookies?.access_token
  const tokenFromHeader = req.headers.authorization?.replace(/^Bearer\s/, '')
  const accessToken = tokenFromCookie ?? tokenFromHeader

  if (!accessToken) return next()

  const { decoded, expired } = verifyAccessToken(accessToken) as any

  if (decoded) {
    res.locals.user = decoded
    req.locals = decoded
  }
  // Jika expired, biarkan lanjut — client harus hit /auth/refresh

  return next()
}

export default deserializedToken
