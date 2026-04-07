import Joi from 'joi'
import { type userType } from '../types/user.type'

export const loginValidation = (payload: userType) => {
  const schema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
    is_web: Joi.boolean().allow('', null),
    is_mobile: Joi.boolean().allow('', null)
  })

  return schema.validate(payload)
}

export const refreshSessionValidation = (payload: userType) => {
  const schema = Joi.object({
    refreshToken: Joi.string().required()
  })

  return schema.validate(payload)
}
