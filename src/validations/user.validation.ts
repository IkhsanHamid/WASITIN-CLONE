import Joi from 'joi'
import { type inviteNewMember, type userOwner, type userType } from '../types/user.type'

export const createUserValidation = (payload: userType) => {
  const schema = Joi.object({
    name: Joi.string().allow('', null).min(3),
    email: Joi.string().email().required(),
    phone: Joi.string().allow('', null),
    type: Joi.string().required().allow('member', 'referee', 'admin')
  })

  return schema.validate(payload)
}

export const staffValidation = (payload: userType) => {
  const schema = Joi.object({
    username: Joi.string().required().min(3),
    password: Joi.string().allow('', null).min(6),
    email: Joi.string().required(),
    fullname: Joi.string().required().min(3),
    company_id: Joi.string().required().min(3),
    role_id: Joi.string().required()
  })

  return schema.validate(payload)
}

export const inviteNewMemberValidation = (payload: inviteNewMember) => {
  const schema = Joi.object({
    username: Joi.string().required().min(3),
    password: Joi.string().required().min(6),
    email: Joi.string().required(),
    fullname: Joi.string().required().min(3),
    role_id: Joi.string().required(),
    company_id: Joi.string().required()
  })

  return schema.validate(payload)
}
