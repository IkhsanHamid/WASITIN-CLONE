import { LicenseInput, refereeType, updateUser, userType } from '../types/user.type'
import { logger } from '../config/logger'
import prisma from '../config/prisma'
import utils from '../utils/utils'

export const findUserbyPhoneNumber = async (phone: string) => {
  const user = await prisma.users.findFirst({
    where: { phone, is_deleted: false },
    select: {
      id: true,
      name: true,
      phone: true,
      password: true,
      email: true,
      roles: {
        select: {
          name: true
        }
      }
    }
  })

  if (!user) {
    return utils.resSuccess(200, 'user not found', null)
  }

  const result = {
    id: user?.id,
    phone: user?.phone,
    name: user?.name,
    role: user?.roles?.name,
    password: user?.password,
    email: user?.email
  }

  return utils.resSuccess(200, 'success', result)
}

export const findUserbyEmail = async (email: string) => {
  const user = await prisma.users.findFirst({
    where: { email, is_deleted: false },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      password: true,
      roles: {
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
    role: user.roles.name,
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
      google_id: true,
      is_active: true,
      roles: { select: { name: true } }
    }
  })

  if (!user) return utils.resErr(404, 'User not found', null)

  return utils.resSuccess(200, 'success', {
    ...user,
    role: user.roles.name
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
      is_active: true,
      roles: { select: { name: true } }
    }
  })

  return utils.resSuccess(200, 'success', {
    ...user,
    role: user.roles.name,
    isNewUser: false
  })
}

export const getUserInfo = async (userId: string) => {
  const user = await prisma.users.findUnique({
    where: {
      id: userId
    },
    select: {
      id: true,
      name: true,
      email: true,
      photo: true,
      phone: true,
      province: true,
      city: true,
      roles: { select: { name: true } }
    }
  })

  return utils.resSuccess(200, 'success', {
    ...user,
    role: user?.roles.name
  })
}

export const updateUserInfo = async (payload: updateUser, userId: string) => {
  const users = await prisma.users.findUnique({
    where: {
      id: userId
    },
    select: {
      id: true,
      name: true,
      email: true,
      photo: true,
      province: true,
      city: true,
      phone: true
    }
  })

  const datas: updateUser = {
    name: payload.name ?? users?.name!,
    email: payload.email ?? users?.email,
    photo: payload.photo ?? users?.photo!,
    province: payload.province ?? users?.province!,
    city: payload.city ?? users?.city!,
    phone: payload.phone ?? users?.phone!
  }

  await prisma.users.update({
    where: {
      id: users?.id
    },
    data: datas
  })

  return utils.resSuccess(200, 'success', null)
}

export const createUserReferee = async (
  payload: {
    name: string
    email: string
    phone: string
    province: string
    city: string
    roleId: string
    photoProfile: string | null
    photos: string[]
    sportId: string
    licenses: LicenseInput[]
  }
) => {
  const referee = await prisma.$transaction(async (tx) => {
    const user = await tx.users.create({
      data: {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        province: payload.province,
        city: payload.city,
        role_id: payload.roleId,
        created_at: new Date()
      }
    })

    const referee = await tx.referees.create({
      data: {
        user_id: user.id,
        photo_profile: payload.photoProfile,
        photos: payload.photos
      }
    })

    await tx.referee_sports.create({
      data: {
        referee_id: referee.id,
        sport_id: payload.sportId
      }
    })
    await tx.licenses.createMany({
      data: payload.licenses.map((l) => ({
        referee_id: referee.id,
        name: l.name,
        license_level: l.licenseLevel,
        organization: l.organization,
        no_license: l.noLicense,
        expired_date: l.expiredDate,
        date_of_issue: l.dateOfIssue,
        file_link: l.fileLink,
        created_at: new Date(),
        updated_at: new Date()
      }))
    })

    return user
  })

  return utils.resSuccess(201, 'success', referee)
}
