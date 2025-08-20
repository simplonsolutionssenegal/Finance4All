import Joi from 'joi';

export const createAdminValidator = Joi.object({
  userId: Joi.string().required(),
  country: Joi.string().required(),
});

export const updateAdminValidator = Joi.object({
  country: Joi.string(),
});
