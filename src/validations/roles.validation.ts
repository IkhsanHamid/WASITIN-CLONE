import Joi from 'joi'
import { type permissionType } from '../types/roles.type'

export const createPermissionsValidation = (payload: permissionType) => {
  const schema = Joi.object({
    role_id: Joi.string().required(),
    name: Joi.array().items(Joi.string())
  })

  return schema.validate(payload)
}
