/**
 * Types pour les formulaires
 * 
 * Ce fichier contient les types spécifiques aux formulaires,
 * séparés selon le principe de responsabilité unique.
 */

// État générique d'un formulaire
export interface FormState {
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  errors: Record<string, string>;
}

// Types pour la validation
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// Types pour les champs de formulaires
export interface FormField<T = unknown> {
  value: T;
  error?: string;
  touched: boolean;
  required?: boolean;
  disabled?: boolean;
}

// Types pour les options de sélection
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
}

// Types pour les fichiers uploadés
export interface FileUpload {
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
  progress?: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

// Types pour les étapes de formulaire multi-étapes
export interface FormStep {
  id: string;
  title: string;
  description?: string;
  isValid: boolean;
  isRequired: boolean;
  order: number;
}

export interface MultiStepFormState {
  currentStep: number;
  steps: FormStep[];
  canGoNext: boolean;
  canGoPrevious: boolean;
  isComplete: boolean;
}