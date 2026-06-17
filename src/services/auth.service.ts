import prisma from '../config/prisma'
import { logger } from '../config/logger'
import utils from '../utils/utils'
import { hashing } from '../config/hashing'
import crypto from 'crypto'
import { sendOTPEmail } from './email-template.service'

export const adminLogin = async (email: string, password: string) => {
  try {
    const user = await prisma.users.findFirst({
      where: { email, is_deleted: false },
      include: { roles: true }
    })

    if (!user) {
      return utils.resErr(401, 'Email atau password salah', null)
    }

    const hashedPassword = hashing(password)
    if (user.password !== hashedPassword) {
      return utils.resErr(401, 'Email atau password salah', null)
    }

    const allowedRoles = ['admin', 'superadmin', 'owner']
    if (!allowedRoles.includes(user.roles.name)) {
      return utils.resErr(403, 'Akses ditolak. Hanya Admin, SuperAdmin, dan Owner yang dapat login', null)
    }

    if (!user.is_active) {
      return utils.resErr(403, 'Akun Anda telah dinonaktifkan', null)
    }

    return utils.resSuccess(200, 'Login berhasil', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.roles.name
    })
  } catch (error) {
    logger.error('ERR: auth - adminLogin = ', error)
    const formattedError = utils.formatUnexpectedError(error)
    throw formattedError
  }
}

export const refereeLogin = async (email: string, password: string) => {
  try {
    const user = await prisma.users.findFirst({
      where: { email, is_deleted: false },
      include: { roles: true }
    })

    if (!user) {
      return utils.resErr(401, 'Email atau password salah', null)
    }

    if (user.roles.name !== 'referee') {
      return utils.resErr(403, 'Akses ditolak. Gunakan login yang sesuai', null)
    }

    const hashedPassword = hashing(password)
    if (user.password !== hashedPassword) {
      return utils.resErr(401, 'Email atau password salah', null)
    }

    if (!user.is_active) {
      return utils.resErr(403, 'Akun Anda telah dinonaktifkan', null)
    }

    const referee = await prisma.referees.findFirst({
      where: { user_id: user.id },
      select: { id: true, is_verification: true }
    })

    if (!referee) {
      return utils.resErr(404, 'Data referee tidak ditemukan', null)
    }

    if (!referee.is_verification) {
      return utils.resErr(403, 'Akun Anda belum diverifikasi. Silakan menunggu 1-3 hari kerja.', null)
    }

    return utils.resSuccess(200, 'Login berhasil', {
      id: user.id,
      referee_id: referee.id,
      email: user.email,
      name: user.name,
      role: user.roles.name
    })
  } catch (error) {
    logger.error('ERR: auth - refereeLogin = ', error)
    const formattedError = utils.formatUnexpectedError(error)
    throw formattedError
  }
}

export const upsertAuthTokens = async (userId: string, accessToken: string, refreshToken: string) => {
  try {
    await prisma.access_token.deleteMany({ where: { user_id: userId } })

    const token = await prisma.access_token.create({
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        user_id: userId,
        updated_at: new Date()
      }
    })

    return utils.resSuccess(201, 'Token saved', token)
  } catch (error) {
    logger.error('Cannot upsert auth tokens', error)
    throw utils.formatUnexpectedError(error)
  }
}

export const findAccessToken = async (userId: string) => {
  return prisma.access_token.findFirst({ where: { user_id: userId } })
}

export const findByRefreshToken = async (refreshToken: string) => {
  return prisma.access_token.findFirst({
    where: { refresh_token: refreshToken },
    include: { user: { include: { roles: true } } }
  })
}

// Hapus semua token user (logout)
export const deleteAuthTokens = async (userId: string) => {
  return prisma.access_token.deleteMany({ where: { user_id: userId } })
}

// ── Forgot Password ───────────────────────────────────────────────────
const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString()
}

export const sendOTP = async (email: string) => {
  try {
    const user = await prisma.users.findFirst({
      where: { email, is_deleted: false },
      include: { roles: true }
    })

    if (!user) {
      return utils.resErr(404, 'Email tidak terdaftar', null)
    }

    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await prisma.password_reset.upsert({
      where: { email },
      update: { otp, expires_at: expiresAt, is_used: false },
      create: { email, otp, expires_at: expiresAt }
    })

    await sendOTPEmail(user.name || email, email, otp).catch((err) => {
      logger.error('ERR: Failed to send OTP email:', err)
    })

    return utils.resSuccess(200, 'OTP berhasil dikirim ke email Anda', { email })
  } catch (error) {
    logger.error('ERR: auth - sendOTP = ', error)
    const formattedError = utils.formatUnexpectedError(error)
    throw formattedError
  }
}

export const verifyOTP = async (email: string, otp: string) => {
  try {
    const resetData = await prisma.password_reset.findFirst({
      where: { email, otp, is_used: false }
    })

    if (!resetData) {
      return utils.resErr(400, 'OTP tidak valid atau sudah digunakan', null)
    }

    if (new Date() > resetData.expires_at) {
      return utils.resErr(400, 'OTP sudah expired', null)
    }

    return utils.resSuccess(200, 'OTP verifikasi berhasil', { email })
  } catch (error) {
    logger.error('ERR: auth - verifyOTP = ', error)
    const formattedError = utils.formatUnexpectedError(error)
    throw formattedError
  }
}

export const resetPassword = async (email: string, newPassword: string) => {
  try {
    const resetData = await prisma.password_reset.findFirst({
      where: { email, is_used: false }
    })

    if (!resetData) {
      return utils.resErr(400, 'Silakan mulai proses reset password dari awal', null)
    }

    if (new Date() > resetData.expires_at) {
      return utils.resErr(400, 'OTP sudah expired, silakan ulangi lagi', null)
    }

    const user = await prisma.users.findFirst({
      where: { email, is_deleted: false }
    })

    if (!user) {
      return utils.resErr(404, 'User tidak ditemukan', null)
    }

    const hashedPassword = hashing(newPassword)

    await prisma.$transaction(async (tx) => {
      await tx.users.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      })

      await tx.password_reset.update({
        where: { id: resetData.id },
        data: { is_used: true }
      })

      await tx.access_token.deleteMany({
        where: { user_id: user.id }
      })
    })

    return utils.resSuccess(200, 'Password berhasil direset', null)
  } catch (error) {
    logger.error('ERR: auth - resetPassword = ', error)
    const formattedError = utils.formatUnexpectedError(error)
    throw formattedError
  }
}
