import Joi from 'joi'
import { updateUser } from '../types/user.type'

export const updateUserValidation = (payload: updateUser) => {
  const schema = Joi.object({
    name: Joi.string().allow('', null).min(3),
    email: Joi.string().email().allow('', null),
    phone: Joi.string().allow('', null),
    photo: Joi.string().allow('', null),
    province: Joi.string().allow('', null),
    city: Joi.string().allow('', null)
  })

  return schema.validate(payload)
}
