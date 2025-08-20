import { Request, Response, NextFunction } from 'express';
import * as AuthService from '../services/auth.service';
import { loginValidator, forgotPasswordValidator, resetPasswordValidator } from '../models/validators/auth.validator';

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { error } = loginValidator.validate(req.body);
  if (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }

  try {
    const { token, user } = await AuthService.login(req.body.email, req.body.password);
    res.status(200).json({ token, user });
  } catch (err: any) {
    next(err); // on passe l'erreur à ton middleware global errorHandler
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { error } = forgotPasswordValidator.validate(req.body);
  if (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }

  try {
    await AuthService.forgotPassword(req.body.email);
    res.status(200).json({ message: 'Lien envoyé avec succès.' });
  } catch (err: any) {
    next(err);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { error } = resetPasswordValidator.validate(req.body);
  if (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }

  try {
    await AuthService.resetPassword(req.body.token, req.body.newPassword);
    res.status(200).json({ message: 'Mot de passe réinitialisé avec succès.' });
  } catch (err: any) {
    next(err);
  }
};
