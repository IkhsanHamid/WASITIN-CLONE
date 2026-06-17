import { type Request, type Response } from 'express'
import { logger } from '../config/logger'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../config/jwt'
import {
  createUser,
  createUserReferee,
  findUserbyEmail,
  findUserByGoogleId,
  getUserInfo,
  linkGoogleToUser
} from '../services/user.service'
import {
  upsertAuthTokens,
  findByRefreshToken,
  deleteAuthTokens,
  adminLogin,
  refereeLogin,
  sendOTP,
  verifyOTP,
  resetPassword
} from '../services/auth.service'
import { getRoles } from '../services/roles.service'
import { rolesType } from '../types/roles.type'
import admin from '../config/firebase'
import { sendBadRequest, sendError, sendSuccess } from '../utils/response.helper'
import { registerRefereeValidation } from '../validations/auth.validation'
import { uploadImage } from '../services/upload.service'
import {
  sendRefereePendingVerificationEmail,
  sendWelcomeEmail,
  sendRefereeRejectedEmail
} from '../services/email-template.service'
import utils from '../utils/utils'
import prisma from '../config/prisma'

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

        if (isNewUser) {
          await sendWelcomeEmail(name ?? email, email).catch((err) => {
            logger.error('ERR: Failed to send welcome email:', err)
          })
        }
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

// ── POST /auth/referee/regist ──────────────────────────────────────────────────
export const registerReferee = async (req: Request, res: Response): Promise<void> => {
  const { value, error } = registerRefereeValidation(req.body)
  if (error) {
    return void sendError(res, error.details[0].message, 422)
  }

  try {
    const {
      name,
      email,
      phone,
      province,
      city,
      sport_id,
      license_name,
      license_level,
      organization,
      no_license,
      expired_date,
      date_of_issue
    } = value
    const existingEmail = await findUserbyEmail(email)

    if (existingEmail?.data) {
      return void sendError(res, 'Email sudah terdaftar', 422)
    }

    const existingPhone = await findUserbyEmail(phone)
    if (existingPhone?.data) {
      return void sendError(res, 'Nomor telepon sudah terdaftar', 422)
    }

    const roles = await getRoles()
    let roleId = ''
    if (roles?.data.length > 0) {
      const refereeRole = roles.data.find((r: rolesType) => r.name === 'referee')
      roleId = refereeRole?.id ?? ''
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] }

    let photoProfileUrl: string | null = null
    const photoProfileFile = files?.['photoProfile']?.[0]
    if (photoProfileFile) {
      photoProfileUrl = await uploadImage(photoProfileFile)
    }

    let photoUrls: string[] = []
    if (files?.['photos']) {
      photoUrls = await Promise.all(files['photos'].map((f) => uploadImage(f)))
    }

    let licenseFileLink = ''
    if (files?.['license1']?.[0]) {
      licenseFileLink = await uploadImage(files['license1'][0])
    }

    const license = {
      name: license_name,
      licenseLevel: license_level,
      organization: organization,
      noLicense: no_license,
      expiredDate: new Date(expired_date),
      dateOfIssue: new Date(date_of_issue),
      fileLink: licenseFileLink
    }

    const user = await createUserReferee({
      email,
      name,
      phone,
      province,
      city,
      roleId,
      sportId: sport_id,
      photoProfile: photoProfileUrl,
      photos: photoUrls,
      licenses: [license]
    })
    if (!user.status) throw new Error('Gagal membuat akun, silakan coba lagi')

    await sendRefereePendingVerificationEmail(name, email).catch((err) => {
      logger.error('ERR: Failed to send pending verification email:', err)
    })

    sendSuccess(res, { id: user.data.id }, 'Akun wasit berhasil didaftarkan')
  } catch (error: any) {
    logger.error('ERR: auth - registerReferee =', error.message)
    sendError(res, error.message, 422)
  }
}

// ── POST /auth/admin/login ────────────────────────────────────────────
export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body

  if (!email || !password) {
    return void sendBadRequest(res, 'Email dan password wajib diisi')
  }

  try {
    const data = await adminLogin(email, password)

    if (!data.status) {
      return void sendError(res, data.message, data.code || 401)
    }

    const tokenPayload = { sub: data.data.id, email: data.data.email, role: data.data.role }
    const accessToken = signAccessToken(tokenPayload)
    const refreshToken = signRefreshToken({ sub: data.data.id })

    await upsertAuthTokens(data.data.id, accessToken, refreshToken)
    setAuthCookies(res, accessToken, refreshToken)

    logger.info(`Admin Login success: ${email}`)

    sendSuccess(
      res,
      { id: data.data.id, name: data.data.name, email: data.data.email, role: data.data.role },
      'Login berhasil'
    )
  } catch (error: any) {
    logger.error('ERR: auth - loginAdmin =', error.message)
    sendError(res, error.message, 422)
  }
}

// ── POST /auth/referee/login ────────────────────────────────────────────
export const loginReferee = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body

  if (!email || !password) {
    return void sendBadRequest(res, 'Email dan password wajib diisi')
  }

  try {
    const data = await refereeLogin(email, password)

    if (!data.status) {
      return void sendError(res, data.message, data.code || 401)
    }

    const tokenPayload = { sub: data.data.id, email: data.data.email, role: data.data.role }
    const accessToken = signAccessToken(tokenPayload)
    const refreshToken = signRefreshToken({ sub: data.data.id })

    await upsertAuthTokens(data.data.id, accessToken, refreshToken)
    setAuthCookies(res, accessToken, refreshToken)

    logger.info(`Referee Login success: ${email}`)

    sendSuccess(
      res,
      {
        id: data.data.id,
        referee_id: data.data.referee_id,
        name: data.data.name,
        email: data.data.email,
        role: data.data.role
      },
      'Login berhasil'
    )
  } catch (error: any) {
    logger.error('ERR: auth - loginReferee =', error.message)
    sendError(res, error.message, 422)
  }
}

// ── POST /auth/forgot-password/send-otp ─────────────────────────────────
export const forgotPasswordSendOTP = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body

  if (!email) {
    return void sendBadRequest(res, 'Email wajib diisi')
  }

  try {
    const data = await sendOTP(email)

    if (!data.status) {
      return void sendError(res, data.message, data.code || 400)
    }

    sendSuccess(res, data.data, 'OTP berhasil dikirim ke email Anda')
  } catch (error: any) {
    logger.error('ERR: auth - forgotPasswordSendOTP =', error.message)
    sendError(res, error.message, 422)
  }
}

// ── POST /auth/forgot-password/verify-otp ───────────────────────────────
export const forgotPasswordVerifyOTP = async (req: Request, res: Response): Promise<void> => {
  const { email, otp } = req.body

  if (!email || !otp) {
    return void sendBadRequest(res, 'Email dan OTP wajib diisi')
  }

  try {
    const data = await verifyOTP(email, otp)

    if (!data.status) {
      return void sendError(res, data.message, data.code || 400)
    }

    sendSuccess(res, data.data, 'OTP verifikasi berhasil')
  } catch (error: any) {
    logger.error('ERR: auth - forgotPasswordVerifyOTP =', error.message)
    sendError(res, error.message, 422)
  }
}

// ── POST /auth/forgot-password/reset ───────────────────────────────────
export const forgotPasswordReset = async (req: Request, res: Response): Promise<void> => {
  const { email, new_password } = req.body

  if (!email || !new_password) {
    return void sendBadRequest(res, 'Email dan password baru wajib diisi')
  }

  if (new_password.length < 6) {
    return void sendBadRequest(res, 'Password minimal 6 karakter')
  }

  try {
    const data = await resetPassword(email, new_password)

    if (!data.status) {
      return void sendError(res, data.message, data.code || 400)
    }

    sendSuccess(res, data.data, 'Password berhasil direset')
  } catch (error: any) {
    logger.error('ERR: auth - forgotPasswordReset =', error.message)
    sendError(res, error.message, 422)
  }
}

export const resubmitRefereeData = async (req: Request, res: Response): Promise<void> => {
  const { data: encryptedData } = req.body

  if (!encryptedData) {
    return void sendError(res, 'Data encryption wajib diisi', 400)
  }

  try {
    let refereeId: string
    try {
      refereeId = utils.decryptWithSecret(encryptedData)
    } catch {
      return void sendError(res, 'Data tidak valid atau telah kadaluarsa', 400)
    }

    const referee = await prisma.referees.findUnique({
      where: { id: refereeId },
      include: { users: { select: { email: true, name: true } } }
    })

    if (!referee) {
      return void sendError(res, 'Referee tidak ditemukan', 404)
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] }

    const licenseFields = ['license1', 'license2', 'license3', 'license4', 'license5']
    const licenseUpdates: Array<{
      id: string
      fileLink?: string
      name?: string
      level?: string
      organization?: string
      noLicense?: string
      expiredDate?: Date
      dateOfIssue?: Date
    }> = []

    for (let i = 0; i < licenseFields.length; i++) {
      const field = licenseFields[i]
      const file = files[field]?.[0]
      // Fetch license record (first by creation order, skipping i rows)
      const license = await prisma.licenses.findFirst({
        where: { referee_id: refereeId, is_deleted: false },
        orderBy: { created_at: 'asc' },
        skip: i
      })

      if (!license) continue

      const updateData: any = { id: license.id }

      if (file) {
        const fileLink = await uploadImage(file)
        updateData.fileLink = fileLink
      }

      // Map body fields to license properties
      const base = `license${i + 1}_`
      const fieldMap = {
        name: 'name',
        level: 'level',
        organization: 'organization',
        no_license: 'noLicense',
        expired_date: 'expiredDate',
        date_of_issue: 'dateOfIssue'
      }
      Object.entries(fieldMap).forEach(([bodyKey, prop]) => {
        const value = req.body[`${base}${bodyKey}`]
        if (value) {
          // Convert dates to Date objects
          if (prop === 'expiredDate' || prop === 'dateOfIssue') {
            updateData[prop] = new Date(value)
          } else {
            updateData[prop] = value
          }
        }
      })

      licenseUpdates.push(updateData)
    }

    await prisma.$transaction(async (tx) => {
      for (const update of licenseUpdates) {
        const data: any = { is_verified: false }
        if (update.fileLink) data.file_link = update.fileLink
        if (update.name) data.name = update.name
        if (update.level) data.license_level = update.level
        if (update.organization) data.organization = update.organization
        if (update.noLicense) data.no_license = update.noLicense
        if (update.expiredDate) data.expired_date = update.expiredDate
        if (update.dateOfIssue) data.date_of_issue = update.dateOfIssue
        await tx.licenses.update({
          where: { id: update.id },
          data
        })
      }

      await tx.referees.update({
        where: { id: refereeId },
        data: { recheck_data: false }
      })
    })

    await sendRefereePendingVerificationEmail(referee.users.name || 'Wasit', referee.users.email).catch((err) => {
      logger.error('ERR: Failed to send resubmit confirmation email:', err)
    })

    sendSuccess(res, null, 'Data lisensi berhasil diperbarui, menunggu verifikasi ulang')
  } catch (error: any) {
    logger.error('ERR: auth - resubmitRefereeData =', error.message)
    sendError(res, error.message, 422)
  }
}

export const checkActiveResubmit = async (req: Request, res: Response): Promise<void> => {
  const { data: encryptedData } = req.body

  if (!encryptedData) {
    return void sendError(res, 'Data encryption wajib diisi', 400)
  }
  try {
    let refereeId: string
    try {
      refereeId = utils.decryptWithSecret(encryptedData)
    } catch {
      return void sendError(res, 'Data tidak valid atau telah kadaluarsa', 400)
    }

    const referee = await prisma.referees.findUnique({
      where: { id: refereeId },
      include: { users: { select: { email: true, name: true } } }
    })

    if (!referee) {
      return void sendError(res, 'Referee tidak ditemukan', 404)
    }

    if (!referee.recheck_data) {
      return void sendError(res, 'Tidak ada permintaan resubmit yang aktif', 404)
    }

    return void sendSuccess(res, null, 'Permintaan resubmit sedang aktif')
  } catch (error: any) {
    logger.error('ERR: auth - checkActiveResubmit =', error.message)
    sendError(res, 'Terjadi kesalahan saat memeriksa status resubmit', 500)
  }
}
