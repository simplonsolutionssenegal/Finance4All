import Joi from 'joi';

export const createOrganisationValidator = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  address: Joi.string().required(),
  country: Joi.string().optional(), // requis uniquement pour Super Admin
});

export const updateOrganisationValidator = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  address: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});
