import prisma from '../config/prisma'
import { logger } from '../config/logger'
import utils from '../utils/utils'

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
