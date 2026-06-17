import { type Request, type Response } from 'express'
import { logger } from '../config/logger'
import { getRoles } from '../services/roles.service'
import { createPermissionsValidation } from '../validations/roles.validation'

export const findRoles = async (req: Request, res: Response) => {
  try {
    const data = await getRoles()
    logger.info('Success find roles')
    return res.status(200).send({ status: true, statusCode: 200, message: 'Success get data roles', data: data.data })
  } catch (error: any) {
    logger.error('ERR: roles - get = ', error)
    return res.status(422).send({ status: false, statusCode: 422, message: error })
  }
}
