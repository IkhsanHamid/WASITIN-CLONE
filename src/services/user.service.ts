import { userType } from 'src/types/user.type'
import { logger } from '../config/logger'
import prisma from '../config/prisma'
import utils from '../utils/utils'

export const findUserbyPhoneNumber = async (phone: string) => {
  const user = await prisma.users.findFirst({
    where: { phone, isDeleted: false },
    select: {
      id: true,
      name: true,
      phone: true,
      password: true,
      email: true,
      role: {
        select: {
          name: true
        }
      }
    }
  })

  if (user) {
    return utils.resSuccess(400, 'already registered', null)
  }

  const result = {
    id: user.id,
    phone: user.phone,
    name: user.name,
    role: user.role.name,
    password: user.password,
    email: user.email
  }

  return utils.resSuccess(200, 'success', result)
}

export const findUserbyEmail = async (email: string) => {
  const user = await prisma.users.findFirst({
    where: { email, isDeleted: false },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      password: true,
      role: {
        select: {
          name: true
        }
      }
    }
  })

  if (!user) {
    return utils.resErr(404, 'Email tidak terdaftar', null)
  }

  const result = {
    id: user.id,
    phone: user.phone,
    name: user.name,
    email: user.email,
    role: user.role.name,
    password: user.password
  }

  return utils.resSuccess(200, 'success', result)
}

export const createUser = async (payload: userType) => {
  const user = await prisma.users.create({
    data: {
      name: payload.name,
      email: payload.email,
      google_id: payload.googleId,
      photo: payload.photo,
      created_at: new Date(),
      role_id: payload.roleId
    }
  })

  return utils.resSuccess(201, 'success', user)
}

// ── Cari user berdasarkan google_id ──────────────────────────────
export const findUserByGoogleId = async (googleId: string) => {
  const user = await prisma.users.findFirst({
    where: { google_id: googleId },
    select: {
      id: true,
      name: true,
      email: true,
      photo: true,
      googleId: true,
      isActive: true,
      role: { select: { name: true } }
    }
  })

  if (!user) return utils.resErr(404, 'User not found', null)

  return utils.resSuccess(200, 'success', {
    ...user,
    role: user.role.name
  })
}

// ── Link google_id ke akun existing ──────────────────────────────
export const linkGoogleToUser = async (userId: string, googleId: string, photo: string | undefined) => {
  const user = await prisma.users.update({
    where: { id: userId },
    data: {
      google_id: googleId,
      photo: photo ?? undefined,
      updated_at: new Date()
    },
    select: {
      id: true,
      name: true,
      email: true,
      photo: true,
      isActive: true,
      role: { select: { name: true } }
    }
  })

  return utils.resSuccess(200, 'success', {
    ...user,
    role: user.role.name,
    isNewUser: false
  })
}
