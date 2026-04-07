// /* eslint-disable prefer-const */
import { type Request, type Response } from 'express'
import { loginValidation, refreshSessionValidation } from '../validations/auth.validation'
import { logger } from '../config/logger'
import { checkPassword, hashing } from '../config/hashing'
import { reIssueAccessToken, signJWT } from '../config/jwt'
import { type AuthType, ResponseWithCompanyId } from '../types/auth.type'
import { type responseController } from '../types/global.type'
import {
  createUser,
  findUserbyEmail,
  findUserByGoogleId,
  findUserbyPhoneNumber,
  linkGoogleToUser
} from '../services/user.service'
import utils from '../utils/utils'
import { createUserValidation } from '../validations/user.validation'
import { getRoles } from '../services/roles.service'
import { rolesType } from 'src/types/roles.type'
import admin from 'src/config/firebase'

// register
export const register = async (req: Request, res: Response): Promise<Response<responseController>> => {
  // START: validation payload
  const { error, value } = createUserValidation(req.body)
  if (error) {
    logger.error('ERR: auth - register = ', error.details[0].message)
    return res.status(422).send({ status: false, statusCode: 422, message: error.details[0].message })
  }
  // END: validation payload
  try {
    // find roles owner
    const roles = await getRoles()

    if (roles?.data.length > 0) {
      const roleName = roles?.data.filter((item: rolesType) => item.name === 'member')
      value.roleId = roleName[0].id
    }

    // START: check if email have registered
    const userEmail = await findUserbyEmail(value.email)

    if (userEmail?.data !== null) {
      throw new Error('Email is Already registered, please use the different email')
    }
    // END: check if phone number have registered

    // hit function createuser service
    logger.info('check create user')
    const regist = await createUser(value)

    // throw error is failed regist
    if (!regist.status) {
      throw new Error('Failed Register, please try again')
    }

    logger.info('check create user finish')

    // return if success
    logger.info('Register successfully, please login')
    const result = regist.data.id
    const encrypt = utils.encryptWithSecret(result)
    const safeId = encodeURIComponent(encrypt)

    // const emailData = {
    //   name: value.name,
    //   email: value.email
    // }

    // sendWelcomeEmail(emailData)
    //   .catch((error) => {
    //     logger.error('Failed to send welcome email (non-blocking):', error)
    //   })
    //   .then((r) => logger.info('success send welcome email', r))

    return res.status(201).send({
      status: true,
      statusCode: 201,
      message: 'Success register',
      data: safeId
    })
  } catch (error: any) {
    logger.error('ERR: auth - regist = ', error.message)
    logger.error('ERR: auth - regist = ', error)
    return res.status(422).send({ status: false, statusCode: 422, message: error.message })
  }
}

export const googleAuth = async (req: Request, res: Response): Promise<Response<responseController>> => {
  const { idToken } = req.body

  if (!idToken) {
    return res.status(422).send({ status: false, statusCode: 422, message: 'Firebase ID Token is required' })
  }

  try {
    // ── 1. Verifikasi token via Firebase Admin SDK ───────────────
    //       (sebelumnya pakai googleClient.verifyIdToken())
    const decodedToken = await admin.auth().verifyIdToken(idToken)

    const { uid: googleId, email, name, picture } = decodedToken

    if (!email) {
      throw new Error('Email not found in token')
    }

    // ── 2. Cek apakah user sudah terdaftar ───────────────────────
    let user = await findUserByGoogleId(googleId)

    if (!user?.data) {
      const existingEmail = await findUserbyEmail(email)

      if (existingEmail?.data) {
        user = await linkGoogleToUser(existingEmail.data.id, googleId, picture)
      } else {
        const roles = await getRoles()
        let roleId: string = ''

        if (roles?.data.length > 0) {
          const roleName = roles.data.filter((item: rolesType) => item.name === 'member')
          roleId = roleName[0].id
        }

        user = await createUser({
          email,
          name: name ?? email,
          googleId,
          photo: picture ?? null,
          roleId
        })

        if (!user.status) {
          throw new Error('Failed to create user, please try again')
        }
      }
    }

    const userData = user.data

    if (!userData.isActive) {
      throw new Error('Your account has been deactivated, please contact support')
    }

    // // ── 3. Generate JWT Access Token ─────────────────────────────
    // const accessToken = jwt.sign(
    //   {
    //     sub: userData.id,
    //     email: userData.email,
    //     role: userData.role,
    //     is_active: userData.isActive
    //   },
    //   process.env.JWT_SECRET as string,
    //   { expiresIn: '15m' }
    // )

    // // ── 4. Generate Refresh Token & simpan ke DB ──────────────────
    // const refreshToken = jwt.sign({ sub: userData.id }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '30d' })

    // await saveRefreshToken({
    //   userId: userData.id,
    //   refreshToken,
    //   expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    // })

    // ── 5. Set refresh token sebagai httpOnly cookie ──────────────
    res.cookie('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000
    })

    logger.info(`Firebase Google Auth success: ${email}`)

    return res.status(200).send({
      status: true,
      statusCode: 200,
      message: userData.isNewUser ? 'Register via Google success' : 'Login via Google success',
      data: {
        user: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          photo: userData.photo,
          role: userData.role
        }
      }
    })
  } catch (error: any) {
    logger.error('ERR: auth - googleAuth = ', error.message)
    return res.status(422).send({ status: false, statusCode: 422, message: error.message })
  }
}
