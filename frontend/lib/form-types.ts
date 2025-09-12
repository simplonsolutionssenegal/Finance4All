/**
 * Interface générique pour l'état d'un formulaire avec gestion d'erreurs
 */
export interface FormState<T extends Record<string, unknown>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
}

/**
 * Interface pour les fonctions de gestion d'un formulaire
 */
export interface FormActions<T extends Record<string, unknown>> {
  updateField: (field: keyof T, value: unknown) => void;
  setFieldError: (field: keyof T, error: string) => void;
  setErrors: (errors: Partial<Record<keyof T, string>>) => void;
  clearErrors: () => void;
  resetForm: () => void;
  hasError: (field: keyof T) => boolean;
  getError: (field: keyof T) => string;
}

/**
 * Interface complète pour un formulaire avec état et actions
 */
export interface FormHook<T extends Record<string, unknown>> {
  formState: FormState<T>;
  isValid: boolean;
  updateField: (field: keyof T, value: unknown) => void;
  setFieldError: (field: keyof T, error: string) => void;
  setErrors: (errors: Partial<Record<keyof T, string>>) => void;
  clearErrors: () => void;
  resetForm: () => void;
  hasError: (field: keyof T) => boolean;
  getError: (field: keyof T) => string;
}
