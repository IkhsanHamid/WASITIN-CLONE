import Joi from 'joi'

export const createBookingValidation = (payload: any) => {
  const schema = Joi.object({
    date: Joi.string().isoDate().required(),
    start_time: Joi.string().required(),
    end_time: Joi.string().required(),
    sport: Joi.string().required(),
    location: Joi.string().optional().allow(''),
    address: Joi.string().optional().allow(''),
    longitude: Joi.number().optional().allow(null),
    latitude: Joi.number().optional().allow(null),
    link_google_maps: Joi.string().uri().optional().allow(''),
    notes: Joi.string().optional().allow(''),
    type_match: Joi.string().required(),
    type_time: Joi.string().required(),
    referees: Joi.array()
      .items(
        Joi.object({
          referee_id: Joi.string().uuid().required(),
          role_referee: Joi.string()
            .valid('MAIN_REFEREE', 'ASSISTANT_REFEREE', 'LINE_REFEREE_1', 'LINE_REFEREE_2')
            .required()
        })
      )
      .min(1)
      .required(),
    voucher_code: Joi.string().optional().allow('')
  })

  return schema.validate(payload, { stripUnknown: true })
}
