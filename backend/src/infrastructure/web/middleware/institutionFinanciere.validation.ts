import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';

export const validateCreateInstitutionFinanciere = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const schema = Joi.object({
    nom: Joi.string().min(2).required().messages({
      'string.empty': 'Le nom est requis',
      'string.min': 'Le nom doit contenir au moins 2 caractères',
    }),
    type: Joi.string().required().messages({
      'string.empty': 'Le type est requis',
    }),
    description: Joi.string().min(10).required().messages({
      'string.empty': 'La description est requise',
      'string.min': 'La description doit contenir au moins 10 caractères',
    }),
    siteWeb: Joi.string().uri().required().messages({
      'string.empty': "L'URL du site web est requise",
      'string.uri': "L'URL du site web n'est pas valide",
    }),
    logo: Joi.string().allow(null, ''),
    contactNom: Joi.string().min(2).allow(null, '').messages({
      'string.min': 'Le nom du contact doit contenir au moins 2 caractères',
    }),
    contactEmail: Joi.string().email().allow(null, '').messages({
      'string.email': "L'adresse email n'est pas valide",
    }),
    contactTelephone: Joi.string().min(8).allow(null, '').messages({
      'string.min': "Le numéro de téléphone n'est pas valide",
    }),
    regionsDesservies: Joi.array().items(Joi.string()).min(1).required().messages({
      'array.min': 'Au moins une région desservie doit être spécifiée',
    }),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessages = error.details.map((detail: Joi.ValidationErrorItem) => detail.message);
    res.status(400).json({
      success: false,
      message: 'Validation échouée',
      errors: errorMessages,
    });
    return;
  }

  next();
};
