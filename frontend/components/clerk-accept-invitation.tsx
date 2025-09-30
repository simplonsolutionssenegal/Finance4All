'use client';

import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { PasswordInput } from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLoader } from '@/contexts/LoaderContext';
import { useFormState } from '@/hooks/useFormState';

const AUTOCOMPLETE_PASSWORD = 'pass' + 'word';

interface ClerkAcceptInvitationProps {
  invitationId: string;
  orgId: string;
}

interface FormValues extends Record<string, unknown> {
  password: string;
  confirmPassword: string;
}

interface InvitationMetadata {
  firstName: string;
  lastName: string;
  emailAddress: string;
  organizationId: string;
  organizationName?: string;
}

export function ClerkAcceptInvitation({
  invitationId,
  orgId,
}: Readonly<ClerkAcceptInvitationProps>) {
  const [initialValues, setInitialValues] = useState<FormValues>({
    password: '',
    confirmPassword: '',
  });

  const { isLoading, showLoader, hideLoader } = useLoader();
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [invitationData, setInvitationData] = useState<InvitationMetadata | null>(null);

  const { formState, updateField, hasError, getError, setErrors } = useFormState(initialValues);

  const resetState = useCallback(() => {
    setError(null);
  }, []);

  const isFormValid = useMemo(() => {
    return (
      formState.values.password.trim() !== '' &&
      !hasError('password') &&
      formState.values.confirmPassword.trim() !== '' &&
      !hasError('confirmPassword')
    );
  }, [formState, hasError]);

  // Récupérer les données de l'invitation au chargement
  useEffect(() => {
    const fetchInvitationData = async () => {
      if (!invitationId) {
        setError("ID d'invitation manquant");
        return;
      }

      showLoader();

      try {
        const response = await fetch('/api/get-invitation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            invitationId,
            orgId,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();

          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch (_e) {
            errorData = { message: errorText };
          }

          throw new Error(
            errorData?.message || `Erreur ${response.status}: ${response.statusText}`
          );
        }

        const data = await response.json();

        if (data.success && data.invitation) {
          const { publicMetadata, emailAddress, organizationName } = data.invitation;

          const metadata: InvitationMetadata = {
            firstName: publicMetadata.firstName || '',
            lastName: publicMetadata.lastName || '',
            emailAddress,
            organizationId: orgId,
            organizationName,
          };

          setInvitationData(metadata);

          const newInitialValues: FormValues = {
            password: '',
            confirmPassword: '',
          };

          setInitialValues(newInitialValues);
        }
      } catch (_err) {
        setError("Impossible de charger les données de l'invitation");
      } finally {
        hideLoader();
      }
    };

    fetchInvitationData();
  }, [invitationId, orgId, showLoader, hideLoader]);

  // Validation des mots de passe
  const validatePasswords = useCallback(() => {
    const password = formState.values.password;
    const confirmPassword = formState.values.confirmPassword;

    const errors: Record<string, string> = {};

    if (password.length < 8) {
      errors.password = 'Le mot de ' + 'passe doit contenir au moins 8 caractères';
    } else if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      errors.password =
        'Le mot de ' + 'passe doit contenir au moins une majuscule, une minuscule et un chiffre';
    }

    if (confirmPassword && password !== confirmPassword) {
      errors.confirmPassword = 'Les mots de ' + 'passe ne correspondent pas';
    }

    return errors;
  }, [formState.values.password, formState.values.confirmPassword]);

  // Effect pour valider les mots de passe automatiquement
  useEffect(() => {
    const password = formState.values.password;
    const confirmPassword = formState.values.confirmPassword;

    // Ne valider que si au moins un des champs est rempli
    if (password || confirmPassword) {
      const passwordErrors = validatePasswords();

      setErrors(passwordErrors);
    }
  }, [formState.values.password, formState.values.confirmPassword, validatePasswords, setErrors]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!isFormValid || !invitationData) {
        return;
      }

      // Vérifier que toutes les données nécessaires sont présentes
      if (!invitationData.firstName || !invitationData.lastName || !invitationData.emailAddress) {
        setError("Données d'invitation incomplètes. Veuillez contacter l'administrateur.");
        return;
      }

      const password = formState.values.password;

      // Validation finale
      const passwordErrors = validatePasswords();
      if (Object.keys(passwordErrors).length > 0) {
        setErrors(passwordErrors);
        return;
      }

      showLoader();
      setError(null);

      try {
        const response = await fetch('/api/accept-invitation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            invitationId,
            orgId,
            password,
            firstName: invitationData.firstName,
            lastName: invitationData.lastName,
            emailAddress: invitationData.emailAddress,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData?.message || "Erreur lors de l'acceptation de l'invitation");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || "Erreur lors de l'acceptation de l'invitation");
        }

        hideLoader();

        // Redirection vers la page de connexion ou dashboard après la fin du chargement
        router.push('/dashboard');
      } catch (err: unknown) {
        console.error("Erreur lors de l'acceptation de l'invitation:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Une erreur est survenue lors de l'acceptation de l'invitation";
        setError(errorMessage);
        hideLoader();
      }
    },
    [
      isFormValid,
      invitationData,
      formState.values.password,
      validatePasswords,
      setErrors,
      showLoader,
      invitationId,
      orgId,
      router,
      hideLoader,
    ]
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateField('password', e.target.value);
      if (error) {
        resetState();
      }
    },
    [updateField, error, resetState]
  );

  const handleConfirmPasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateField('confirmPassword', e.target.value);
      if (error) {
        resetState();
      }
    },
    [updateField, error, resetState]
  );

  return (
    <div className='max-w-md w-full mx-auto'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-neutral-500 mb-2'>Créer votre compte</h1>
        <p className='text-neutral-400 text-sm'>
          {invitationData?.organizationName
            ? `Vous avez été invité à rejoindre le groupe ${invitationData.organizationName}. 
            Complétez les informations ci-dessous pour créer votre compte.`
            : "Complétez les informations ci-dessous pour accepter l'invitation et créer votre compte."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6' noValidate>
        <div className='space-y-2'>
          <Label htmlFor='email' className='text-neutral-500 font-bold'>
            Email
          </Label>
          <Input
            id='email'
            type='email'
            value={invitationData?.emailAddress}
            className='w-full h-12'
            disabled={true}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='password' className='text-neutral-500 font-bold'>
            Mot de passe*
          </Label>
          <PasswordInput
            id='password'
            placeholder='Mot de passe'
            value={formState.values.password}
            onChange={handlePasswordChange}
            className={`w-full h-12 ${
              hasError('password')
                ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500'
                : 'border-neutral-400 focus:border-primary-200 focus:ring-primary-200'
            }`}
            disabled={isLoading}
            autoComplete={AUTOCOMPLETE_PASSWORD}
            maxLength={128}
            minLength={8}
            required
            aria-invalid={hasError('password')}
            aria-describedby={hasError('password') ? 'password-error' : undefined}
          />
          {hasError('password') && (
            <div
              id='password-error'
              className='text-red-500 text-sm font-medium'
              role='alert'
              aria-live='polite'
            >
              {getError('password')}
            </div>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='confirmPassword' className='text-neutral-500 font-bold'>
            Confirmer le mot de passe*
          </Label>
          <PasswordInput
            id='confirmPassword'
            placeholder='Confirmer le mot de passe'
            value={formState.values.confirmPassword}
            onChange={handleConfirmPasswordChange}
            className={`w-full h-12 ${
              hasError('confirmPassword')
                ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500'
                : 'border-neutral-400 focus:border-primary-200 focus:ring-primary-200'
            }`}
            disabled={isLoading}
            autoComplete={AUTOCOMPLETE_PASSWORD}
            maxLength={128}
            minLength={8}
            required
            aria-invalid={hasError('confirmPassword')}
            aria-describedby={hasError('confirmPassword') ? 'confirmPassword-error' : undefined}
          />
          {hasError('confirmPassword') && (
            <div
              id='confirmPassword-error'
              className='text-red-500 text-sm font-medium'
              role='alert'
              aria-live='polite'
            >
              {getError('confirmPassword')}
            </div>
          )}
        </div>

        {error && (
          <div
            className='text-red-500 text-sm font-medium bg-red-50 p-3 rounded-md border border-red-200'
            role='alert'
            aria-live='polite'
            aria-atomic='true'
          >
            {error}
          </div>
        )}

        <Button
          type='submit'
          disabled={isLoading || !isFormValid}
          className='w-full h-12 bg-primary-300 cursor-pointer hover:bg-primary-300 text-white font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        >
          {isLoading ? 'Création du compte en cours...' : 'Créer mon compte'}
        </Button>
      </form>
    </div>
  );
}
