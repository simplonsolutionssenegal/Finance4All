import { useState, useCallback } from 'react';

import type { FormState, FormHook } from '@/lib/form-types';

// Réexport des types pour maintenir la compatibilité
export type { FormState, FormHook } from '../lib/form-types';

/**
 * Hook personnalisé pour gérer l'état d'un formulaire avec validation
 * @param initialValues - Valeurs initiales du formulaire
 * @returns Objet contenant l'état du formulaire et les fonctions de gestion
 */
export function useFormState<T extends Record<string, unknown>>(initialValues: T): FormHook<T> {
  const [formState, setFormState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
  });

  //Met à jour la valeur d'un champ et efface son erreur
  const updateField = useCallback((field: keyof T, value: unknown) => {
    setFormState(prev => ({
      ...prev,
      values: {
        ...prev.values,
        [field]: value,
      },
      errors: {
        ...prev.errors,
        [field]: '',
      },
    }));
  }, []);

  //Met à jour l'erreur d'un champ spécifique
  const setFieldError = useCallback((field: keyof T, error: string) => {
    setFormState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [field]: error,
      },
    }));
  }, []);

  //Met à jour plusieurs erreurs à la fois
  const setErrors = useCallback((errors: Partial<Record<keyof T, string>>) => {
    setFormState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        ...errors,
      },
    }));
  }, []);

  //Valide le formulaire avec des erreurs personnalisées
  const validate = useCallback((errors: Partial<Record<keyof T, string>>) => {
    setFormState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        ...errors,
      },
    }));
  }, []);

  //Efface toutes les erreurs
  const clearErrors = useCallback(() => {
    setFormState(prev => ({
      ...prev,
      errors: {},
    }));
  }, []);

  //Réinitialise le formulaire aux valeurs initiales
  const resetForm = useCallback(() => {
    setFormState({
      values: initialValues,
      errors: {},
    });
  }, [initialValues]);

  //Vérifie si le formulaire est valide (pas d'erreurs)
  const isValid = Object.values(formState.errors).every(error => !error);

  //Vérifie si un champ spécifique a une erreur
  const hasError = useCallback(
    (field: keyof T) => {
      return !!formState.errors[field];
    },
    [formState.errors]
  );

  //Obtient l'erreur d'un champ spécifique
  const getError = useCallback(
    (field: keyof T) => {
      return formState.errors[field] || '';
    },
    [formState.errors]
  );

  return {
    formState,
    updateField,
    setFieldError,
    setErrors,
    validate,
    clearErrors,
    resetForm,
    isValid,
    hasError,
    getError,
  };
}
