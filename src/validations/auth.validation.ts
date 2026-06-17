import Joi from 'joi'
import { refereeType, type userType } from '../types/user.type'

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

export const registerRefereeValidation = (payload: refereeType) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string()
      .pattern(/^[0-9+]{10,15}$/)
      .required(),
    province: Joi.string().required(),
    city: Joi.string().required(),
    sport_id: Joi.string().required(),
    license_name: Joi.string().required(),
    license_level: Joi.string().required(),
    organization: Joi.string().required(),
    no_license: Joi.string().required(),
    expired_date: Joi.string().required(),
    date_of_issue: Joi.string().required()
  })

  return schema.validate(payload, { stripUnknown: true })
}
