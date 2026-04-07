// import { allUsers, createUserStaff, getUserInfo, updateUserInfo } from '../services/user.service'
// import { logger } from '../config/logger'
// import { type Request, type Response } from 'express'
// import { type responseController } from '../types/global.type'
// import { staffValidation } from '../validations/user.validation'
// import { hashing } from '../config/hashing'

// export const getUserController = async (req: Request, res: Response): Promise<Response<responseController>> => {
//   try {
//     const user = await getUserInfo(req.locals.code)
//     return res.status(200).send({ status: true, statusCode: 200, message: user.msg, data: user.data })
//   } catch (error) {
//     logger.error('ERR: category - get = ', error)
//     return res.status(422).send({ status: false, statusCode: 422, message: error })
//   }
// }

// export const getAllUsers = async (req: Request, res: Response): Promise<Response<responseController>> => {
//   try {
//     const { skip, limit, keyword, companyId } = req.query

//     // Pastikan skip dan limit hanya dikonversi jika ada
//     const parsedSkip = skip !== undefined ? Number(skip) : undefined
//     const parsedLimit = limit !== undefined ? Number(limit) : undefined

//     if (parsedSkip !== undefined && isNaN(parsedSkip)) {
//       throw new Error('Skip must be a valid number')
//     }
//     if (parsedLimit !== undefined && isNaN(parsedLimit)) {
//       throw new Error('Limit must be a valid number')
//     }

//     const users = await allUsers(companyId as string, keyword as string, parsedSkip, parsedLimit)
//     return res.status(200).send({
//       status: true,
//       statusCode: 200,
//       message: users.msg,
//       data: users.data,
//       skip: users.skip,
//       limit: users.limit,
//       totalData: users.totalData,
//       totalPages: users.totalPages,
//       currentPage: users.currentPage
//     })
//   } catch (error: any) {
//     logger.error('ERR: users - get = ', error.message)
//     return res.status(422).send({ status: false, statusCode: 422, message: error.message })
//   }
// }

// export const updateUserData = async (req: Request, res: Response) => {
//   // START: validation payload
//   const { error, value } = staffValidation(req.body)
//   if (error) {
//     logger.error('ERR: user - update  = ', error.details[0].message)
//     return res.status(422).send({ status: false, statusCode: 422, message: error.details[0].message })
//   }
//   // END: validation payload
//   try {
//     const { userId } = req.query
//     const update = await updateUserInfo(userId as string, value)

//     return res.status(200).send({ status: true, statusCode: 200, message: 'Success', data: update })
//   } catch (error: any) {
//     const errorMsg = error?.message ? error.message : error
//     logger.error('ERR: user - update = ', errorMsg)
//     return res.status(422).send({ status: false, statusCode: 422, message: errorMsg })
//   }
// }

// export const addStaff = async (req: Request, res: Response): Promise<Response<responseController>> => {
//   // START: validation payload
//   const { error, value } = staffValidation(req.body)
//   if (error) {
//     logger.error('ERR: user - add staff = ', error.details[0].message)
//     return res.status(422).send({ status: false, statusCode: 422, message: error.details[0].message })
//   }
//   // END: validation payload
//   try {
//     value.password = `${hashing(value.password)}`

//     const staff = await createUserStaff(value)
//     return res.status(201).send({ status: true, statusCode: 201, message: 'Success', data: staff })
//   } catch (error: any) {
//     const errorMsg = error?.message ? error.message : error
//     logger.error('ERR: user - add staff= ', errorMsg)
//     return res.status(422).send({ status: false, statusCode: 422, message: errorMsg })
//   }
// }
