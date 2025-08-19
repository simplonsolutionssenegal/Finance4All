import Joi from 'joi';

export const loginValidator = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const forgotPasswordValidator = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordValidator = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});
