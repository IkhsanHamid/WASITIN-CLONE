/* eslint-disable @typescript-eslint/ban-types */
import jwt from 'jsonwebtoken'
import CONFIG from './environment'
import { findUserbyEmail } from '../services/user.service'

export const signJWT = (payload: Object, options?: jwt.SignOptions | undefined) => {
  return jwt.sign(payload, CONFIG.jwt_private, {
    ...(options && options),
    algorithm: 'RS256'
  })
}

export const verifyJWT = (token: string) => {
  try {
    const decode = jwt.verify(token, CONFIG.jwt_public)
    return {
      valid: true,
      expired: false,
      decoded: decode
    }
  } catch (error: any) {
    return {
      valid: false,
      expired: error.message === 'jwt is expired or not eligible to use',
      decoded: null
    }
  }
}

export const reIssueAccessToken = async (refreshToken: string) => {
  const { decoded } = verifyJWT(refreshToken) as any
  if (!decoded && !decoded.username) {
    return false
  }

  const user = await findUserbyEmail(decoded.email)

  if (!user.data) {
    return false
  }
  const data = { ...user.data }
  const accessToken = signJWT(data, { expiresIn: '1d' })
  const username = decoded.username

  return {
    accessToken,
    username,
    user_id: user.data.id
  }
}
