// import { logger } from '../config/logger'
// import { type AuthType, type SessionType } from '../types/auth.type'
// import prisma from '../config/prisma'
// import utils from '../utils/utils'
// import { signJWT } from '../config/jwt'

// export const createAuth = async (payload: AuthType) => {
//   try {
//     const whereClause = {
//       user_id: payload.user_id,
//       ...(payload.is_web !== undefined && { is_mobile: payload.is_mobile }),
//       ...(payload.is_mobile !== undefined && { is_web: payload.is_web })
//     }

//     const findAuth = await prisma.access_token.findFirst({ where: whereClause })

//     if (findAuth?.is_mobile && payload.is_mobile) {
//       await prisma.access_token.delete({
//         where: {
//           id: findAuth.id
//         }
//       })
//     }

//     if ((findAuth?.is_mobile && payload.is_mobile) || !findAuth) {
//       // generate token
//       const accessToken = await generateAccessToken(payload.user_id)

//       if (!accessToken) {
//         const error = {
//           status: false,
//           statusCode: 401,
//           message: 'Invalid credential, please try again'
//         }
//         throw error
//       }

//       const flagging = {
//         access_token: accessToken,
//         user_id: payload.user_id,
//         created_at: new Date(),
//         ...(payload.is_web !== undefined && { is_web: payload.is_web }),
//         ...(payload.is_mobile !== undefined && { is_mobile: payload.is_mobile })
//       }

//       await prisma.$transaction([
//         prisma.access_token.create({
//           data: flagging
//         }),
//         prisma.users.updateMany({
//           where: { id: payload.user_id },
//           data: { is_login: true, updated_at: new Date() }
//         })
//       ])

//       return { msg: 'success', data: accessToken }
//     }
//     // console.log('test 1: ', findAuth?.is_mobile)
//     // console.log('test 2: ', payload.is_mobile)
//     // Handle Double Login
//     if ((findAuth.is_web && findAuth.is_mobile) || (findAuth.is_web && payload.is_web)) {
//       throw new Error('Double Login!')
//     }

//     // Update existing session if either `is_web` or `is_mobile` is missing
//     const updateData = {
//       ...(!findAuth.is_web && { is_web: true }),
//       ...(!findAuth.is_mobile && { is_mobile: true })
//     }

//     if (Object.keys(updateData).length > 0) {
//       await prisma.access_token.update({
//         where: { id: findAuth.id },
//         data: updateData
//       })

//       return { msg: 'success', data: findAuth.access_token }
//     }

//     return { msg: 'No changes made', data: findAuth.access_token }
//   } catch (error) {
//     logger.error('Cannot create auth', error)
//     throw utils.formatUnexpectedError(error)
//   }
// }

// export const destroyAuth = async (token: string) => {
//   try {
//     await prisma.$transaction(async (transaction) => {
//       const auth = await transaction.access_token.findFirst({
//         where: { access_token: token }
//       })

//       if (!auth) {
//         throw new Error('access_token token not found')
//       }
//       const userId = auth.user_id

//       await transaction.$queryRaw`
//         DELETE FROM access_token WHERE access_token.user_id = ${userId}::uuid;
//       `

//       await transaction.$executeRaw`
//         UPDATE users
//         SET is_login = false, updated_at = ${new Date()}
//         WHERE id = ${userId}::uuid;
//       `
//     })

//     return Promise.resolve({
//       msg: 'success'
//     })
//   } catch (error) {
//     logger.error('Cannot destroy auth', error)
//     const formattedError = utils.formatUnexpectedError(error)
//     throw formattedError
//   }
// }

// export const findAccessToken = async (userId: string) => {
//   try {
//     const findAuth = await prisma.access_token.findFirst({
//       where: {
//         user_id: userId
//       }
//     })
//     return Promise.resolve(findAuth)
//   } catch (error) {
//     const formattedError = utils.formatUnexpectedError(error)
//     throw formattedError
//   }
// }

// export const updateAccessToken = async (token: SessionType) => {
//   try {
//     const updatedAuth = await prisma.$transaction(async (transaction) => {
//       const user = await transaction.access_token.findFirst({
//         where: {
//           user_id: token.user_id
//         }
//       })

//       if (!user) {
//         throw new Error('User not found')
//       }

//       const auth = await transaction.access_token.update({
//         where: {
//           id: user.id
//         },
//         data: {
//           access_token: token.accessToken
//         }
//       })

//       return auth
//     })

//     return Promise.resolve({
//       msg: 'success',
//       data: updatedAuth
//     })
//   } catch (error) {
//     const formattedError = utils.formatUnexpectedError(error)
//     throw formattedError
//   }
// }

// export const generateAccessToken = async (userId: string) => {
//   try {
//     // Generate JWT tokens
//     const encodedUserId = utils.encryptWithSecret(userId)
//     const accessToken = signJWT({ code: encodedUserId }, { expiresIn: '1d' })

//     return accessToken
//   } catch (error) {}
// }
