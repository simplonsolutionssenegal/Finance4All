import {
  validateEmail as validateEmailBase,
  validatePassword as validatePasswordBase,
} from './validation';

export const validateFullName = (value: string): string | null => {
  if (!value.trim()) {
    return 'Le nom complet est requis';
  }
  if (value.trim().length < 2) {
    return 'Le nom doit contenir au moins 2 caractères';
  }
  if (value.trim().length > 100) {
    return 'Le nom ne peut pas dépasser 100 caractères';
  }
  return null;
};

export const validatePhone = (value: string): string | null => {
  if (!value.trim()) {
    return 'Le numéro de téléphone est requis';
  }

  // Supprimer tous les espaces et caractères non numériques sauf +
  const cleanPhone = value.replace(/[^\d+]/g, '');

  if (cleanPhone.length < 8) {
    return 'Le numéro de téléphone doit contenir au moins 8 chiffres';
  }
  if (cleanPhone.length > 20) {
    return 'Le numéro de téléphone ne peut pas dépasser 20 caractères';
  }

  return null;
};

export const validateEmail = (value: string): string | null => {
  const error = validateEmailBase(value);
  return error || null;
};

export const validatePassword = (value: string): string | null => {
  const error = validatePasswordBase(value);
  return error || null;
};
