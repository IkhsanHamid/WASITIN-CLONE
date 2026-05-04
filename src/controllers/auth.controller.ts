import { type Request, type Response } from 'express'
import { logger } from '../config/logger'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../config/jwt'
import {
  createUser,
  findUserbyEmail,
  findUserByGoogleId,
  getUserInfo,
  linkGoogleToUser
} from '../services/user.service'
import { upsertAuthTokens, findByRefreshToken, deleteAuthTokens } from '../services/auth.service'
import { getRoles } from '../services/roles.service'
import { rolesType } from '../types/roles.type'
import admin from '../config/firebase'
import { sendBadRequest, sendError, sendSuccess } from '../utils/response.helper'

// ── Helper: set httpOnly cookies ─────────────────────────────────
const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000
  })
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000
  })
}

// ── Helper: clear cookies ────────────────────────────────────────
const clearAuthCookies = (res: Response) => {
  res.clearCookie('access_token')
  res.clearCookie('refresh_token')
}

// ── POST /auth/google ─────────────────────────────────────────────
export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  const { idToken } = req.body

  if (!idToken) {
    return void sendBadRequest(res, 'Firebase ID Token is required')
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken)
    const { uid: googleId, email, name, picture } = decodedToken

    if (!email) throw new Error('Email not found in token')

    let user = await findUserByGoogleId(googleId)
    let isNewUser = false

    if (!user?.data) {
      const existingEmail = await findUserbyEmail(email)

      if (existingEmail?.data) {
        user = await linkGoogleToUser(existingEmail.data.id, googleId, picture)
      } else {
        const roles = await getRoles()
        let roleId = ''
        if (roles?.data.length > 0) {
          const memberRole = roles.data.find((r: rolesType) => r.name === 'member')
          roleId = memberRole?.id ?? ''
        }

        user = await createUser({ email, name: name ?? email, googleId, photo: picture ?? null, roleId })
        if (!user.status) throw new Error('Failed to create user, please try again')
        isNewUser = true
      }
    }

    const userData = user.data
    if (!userData.is_active) throw new Error('Your account has been deactivated, please contact support')

    const tokenPayload = { sub: userData.id, email: userData.email, role: userData.role }
    const accessToken = signAccessToken(tokenPayload)
    const refreshToken = signRefreshToken({ sub: userData.id })

    await upsertAuthTokens(userData.id, accessToken, refreshToken)
    setAuthCookies(res, accessToken, refreshToken)

    logger.info(`Google Auth success: ${email}`)

    sendSuccess(
      res,
      { id: userData.id, name: userData.name, email: userData.email, photo: userData.photo, role: userData.role },
      isNewUser ? 'Register via Google success' : 'Login via Google success'
    )
  } catch (error: any) {
    logger.error('ERR: auth - googleAuth =', error.message)
    sendError(res, error.message, 422)
  }
}

// ── POST /auth/refresh ────────────────────────────────────────────
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.refresh_token

  if (!token) {
    return void sendError(res, 'Refresh token not found', 401)
  }

  try {
    const { valid, decoded } = verifyRefreshToken(token) as any
    if (!valid || !decoded?.sub) {
      clearAuthCookies(res)
      return void sendError(res, 'Invalid or expired refresh token', 401)
    }

    const storedToken = await findByRefreshToken(token)
    if (!storedToken) {
      clearAuthCookies(res)
      return void sendError(res, 'Refresh token not recognized', 401)
    }

    const user = storedToken.user
    const newAccessToken = signAccessToken({ sub: user.id, email: user.email, role: user.roles?.name })
    const newRefreshToken = signRefreshToken({ sub: user.id })

    await upsertAuthTokens(user.id, newAccessToken, newRefreshToken)
    setAuthCookies(res, newAccessToken, newRefreshToken)

    sendSuccess(res, null, 'Token refreshed')
  } catch (error: any) {
    logger.error('ERR: auth - refreshToken =', error.message)
    clearAuthCookies(res)
    sendError(res, error.message, 401)
  }
}

// ── POST /auth/logout ─────────────────────────────────────────────
export const logout = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.refresh_token

  try {
    if (token) {
      const storedToken = await findByRefreshToken(token)
      if (storedToken) {
        await deleteAuthTokens(storedToken.user_id)
      }
    }

    clearAuthCookies(res)
    sendSuccess(res, null, 'Logout success')
  } catch (error: any) {
    logger.error('ERR: auth - logout =', error.message)
    sendError(res, error.message, 422)
  }
}

// ── GET /auth/me ──────────────────────────────────────────────────
export const getMe = async (req: Request, res: Response): Promise<void> => {
  const userId = req.locals?.sub

  if (!userId) {
    return void sendError(res, 'Unauthorized', 401)
  }

  const user = await getUserInfo(userId)
  sendSuccess(res, user.data, 'Success')
}
