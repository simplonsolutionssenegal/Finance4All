import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z.string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères'),
  lastName: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  email: z.string()
    .email('Email invalide'),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  terms: z.boolean()
    .refine(val => val === true, 'Vous devez accepter les conditions d\'utilisation'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
/**
 * Fonctions de validation réutilisables pour les formulaires
 */

export const validateEmail = (email: string): string => {
  if (!email.trim()) return "L'adresse email est requise.";

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Rejeter les emails avec des doubles points consécutifs
  if (email.includes('..')) return 'Veuillez entrer une adresse email valide.';
  if (!emailRegex.test(email)) return 'Veuillez entrer une adresse email valide.';

  if (email.length > 254) return "L'adresse email est trop longue.";

  return '';
};

export const validatePassword = (password: string): string => {
  if (!password.trim()) return 'Le mot de passe est requis.';

  if (password.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères.';

  if (password.length > 128) return 'Le mot de passe est trop long.';

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const complexityScore = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(
    Boolean
  ).length;

  if (complexityScore < 3) {
    return 'Le mot de passe doit contenir au moins 3 des éléments suivants : majuscules, minuscules, chiffres, caractères spéciaux.';
  }

  return '';
};

export const validateOTPCode = (code: string, minLength: number = 6): string => {
  if (!code.trim()) return 'Le code est requis.';

  if (code.length < minLength) return `Le code doit contenir au moins ${minLength} caractères.`;

  return '';
};
