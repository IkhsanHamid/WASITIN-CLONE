import { type Request, type Response } from 'express'
import { logger } from '../config/logger'
import { addPermission, deletePermission, getRoles, upPermission } from '../services/roles.service'
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

export const insertPermission = async (req: Request, res: Response) => {
  try {
    // START: validation payload
    const { error, value } = createPermissionsValidation(req.body)
    if (error) {
      logger.error('ERR: permission - post = ', error.details[0].message)
      return res.status(422).send({ status: false, statusCode: 422, message: error.details[0].message })
    }
    // END: validation payload

    const data = await addPermission(value.role_id, value.name)
    return res.status(201).send({ status: true, statusCode: 201, message: data.message, data: data.count })
  } catch (error) {
    logger.error('ERR: roles - insert permission = ', error)
    return res.status(422).send({ status: false, statusCode: 422, message: error })
  }
}

export const updatePermission = async (req: Request, res: Response) => {
  try {
    // START: validation payload
    const { error, value } = createPermissionsValidation(req.body)
    if (error) {
      logger.error('ERR: permission - update = ', error.details[0].message)
      return res.status(422).send({ status: false, statusCode: 422, message: error.details[0].message })
    }
    // END: validation payload

    const data = await upPermission(value.role_id, value.name)
    return res.status(200).send({ status: true, statusCode: 200, message: 'Success update permissions data', data })
  } catch (error) {
    logger.error('ERR: roles - update permission = ', error)
    return res.status(422).send({ status: false, statusCode: 422, message: error })
  }
}

export const delPermission = async (req: Request, res: Response) => {
  try {
    const { id } = req.query
    const data = await deletePermission(String(id))
    return res
      .status(200)
      .send({ status: true, statusCode: 200, message: 'Success delete permissions data', data: null })
  } catch (error) {
    logger.error('ERR: roles - delete permission = ', error)
    return res.status(422).send({ status: false, statusCode: 422, message: error })
  }
}
