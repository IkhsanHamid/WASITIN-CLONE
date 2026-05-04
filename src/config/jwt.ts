import jwt from 'jsonwebtoken'
import CONFIG from './environment'

export const signAccessToken = (payload: object) => {
  return jwt.sign(payload, CONFIG.jwt_private, {
    algorithm: 'RS256',
    expiresIn: '15m' // short-lived
  })
}

export const signRefreshToken = (payload: object) => {
  // Gunakan secret simetris untuk refresh token (lebih ringan)
  const secret = process.env.REFRESH_TOKEN_SECRET as string
  return jwt.sign(payload, secret, { expiresIn: '30d' })
}

export const verifyAccessToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, CONFIG.jwt_public)
    return { valid: true, expired: false, decoded }
  } catch (error: any) {
    return {
      valid: false,
      expired: error.message === 'jwt expired',
      decoded: null
    }
  }
}

export const verifyRefreshToken = (token: string) => {
  try {
    const secret = process.env.REFRESH_TOKEN_SECRET as string
    const decoded = jwt.verify(token, secret)
    return { valid: true, decoded }
  } catch {
    return { valid: false, decoded: null }
  }
}
