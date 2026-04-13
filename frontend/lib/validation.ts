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

/**
 * Valide le prénom
 * @param firstName - Prénom à valider
 * @returns Message d'erreur ou chaîne vide si valide
 */
export const validateFirstName = (firstName: string): string => {
  if (!firstName.trim()) return 'Le prénom est requis.';

  if (firstName.trim().length < 2) return 'Le prénom doit contenir au moins 2 caractères.';

  if (firstName.trim().length > 50) return 'Le prénom ne peut pas dépasser 50 caractères.';

  // Vérifie que le prénom ne contient que des lettres, espaces, tirets et apostrophes
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
  if (!nameRegex.test(firstName.trim())) {
    return 'Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes.';
  }

  return '';
};

/**
 * Valide le nom de famille
 * @param lastName - Nom de famille à valider
 * @returns Message d'erreur ou chaîne vide si valide
 */
export const validateLastName = (lastName: string): string => {
  if (!lastName.trim()) return 'Le nom est requis.';

  if (lastName.trim().length < 2) return 'Le nom doit contenir au moins 2 caractères.';

  if (lastName.trim().length > 50) return 'Le nom ne peut pas dépasser 50 caractères.';

  // Vérifie que le nom ne contient que des lettres, espaces, tirets et apostrophes
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
  if (!nameRegex.test(lastName.trim())) {
    return 'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes.';
  }

  return '';
};

/**
 * Valide un numéro de téléphone au format international E.164
 * @param phone - Numéro de téléphone à valider
 * @returns Message d'erreur ou chaîne vide si valide
 */
export const validatePhone = (phone: string): string => {
  const trimmed = phone.trim().replace(/[\s-]/g, '');

  if (!trimmed) return 'Le numéro de téléphone est requis.';

  // Vérifie que le numéro commence bien par + et un code pays
  if (!trimmed.startsWith('+')) {
    return 'Le numéro doit commencer par + suivi du code pays (ex: +22370112233).';
  }

  // Vérifie la structure générale E.164
  const phoneRegex = /^\+[1-9]\d{7,14}$/;
  if (!phoneRegex.test(trimmed)) {
    return 'Numéro de téléphone invalide (format international requis).';
  }

  return '';
};

/**
 * Valide un champ du formulaire de bénéficiaire
 * @param field - Nom du champ à valider
 * @param value - Valeur du champ à valider
 * @returns Message d'erreur ou chaîne vide si valide
 */
export const validateBirthDate = (value: string): string => {
  if (!value.trim()) return 'La date de naissance est requise';
  const date = new Date(value);
  if (isNaN(date.getTime())) return 'Date invalide';
  const now = new Date();
  if (date > now) return 'La date ne peut pas être dans le futur';
  const age = Math.floor((now.getTime() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  if (age < 15) return 'Vous devez avoir au moins 15 ans';
  return '';
};

export const validateGender = (value: string): string => {
  if (!value.trim()) return 'Le genre est requis';
  if (!['HOMME', 'FEMME'].includes(value)) return 'Valeur invalide';
  return '';
};

export const validateBeneficiaryField = (field: string, value: string): string => {
  switch (field) {
    case 'firstName':
      return validateFirstName(value);
    case 'lastName':
      return validateLastName(value);
    case 'phone':
      return validatePhone(value);
    case 'email':
      return validateEmail(value);
    case 'birthDate':
      return validateBirthDate(value);
    case 'gender':
      return validateGender(value);
    default:
      return '';
  }
};
