'use client';

import { Lock, Mail, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { PasswordInput } from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLoader } from '@/contexts/LoaderContext';
import { useFormState } from '@/hooks/useFormState';

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showLoader, hideLoader } = useLoader(); // Keep global loader for initial data fetch if needed, checking useEffect
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invitationId, orgId]);

  // Validation des mots de passe
  const validatePasswords = useCallback(() => {
    const password = formState.values.password;
    const confirmPassword = formState.values.confirmPassword;

    const errors: Record<string, string> = {};

    if (password.length < 8) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    } else if (
      !/[a-z]/.test(password) ||
      !/[A-Z]/.test(password) ||
      !/\d/.test(password) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      errors.password =
        'Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial';
    }

    if (confirmPassword && password !== confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
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

      setIsSubmitting(true);
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

        // Redirection vers la page de connexion
        router.push('/login');
      } catch (err: unknown) {
        console.error("Erreur lors de l'acceptation de l'invitation:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Une erreur est survenue lors de l'acceptation de l'invitation";
        setError(errorMessage);
        setIsSubmitting(false);
      }
    },
    [
      isFormValid,
      invitationData,
      formState.values.password,
      validatePasswords,
      setErrors,
      invitationId,
      orgId,
      router,
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

  // Helper for password requirements
  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className='flex items-center gap-2 text-xs text-neutral-500'>
      <div
        className={`flex items-center justify-center w-4 h-4 rounded-full border ${
          met ? 'bg-primary-50 border-primary-200' : 'border-neutral-300'
        }`}
      >
        {met && (
          <svg width='10' height='8' viewBox='0 0 10 8' fill='none'>
            <path
              d='M1 4L3.5 6.5L9 1'
              stroke='#0F172A'
              strokeWidth='1.5'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        )}
      </div>
      <span>{text}</span>
    </div>
  );

  const password = formState.values.password;
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    <div className='max-w-md w-full mx-auto'>
      <div className='flex flex-col items-center mb-8'>
        <div className='w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-6'>
          <Lock className='w-8 h-8 text-primary-300' strokeWidth={1.5} />
        </div>
        <h1 className='text-2xl font-semibold text-neutral-900 mb-2'>Créer votre mot de passe</h1>
        <p className='text-neutral-500 text-center text-sm px-4'>
          Définissez un mot de passe sécurisé pour votre compte{' '}
          {invitationData?.organizationName ? 'administrateur' : 'utilisateur'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6' noValidate>
        <div className='space-y-2'>
          <Label htmlFor='email' className='text-neutral-900 font-medium text-sm'>
            Adresse email
          </Label>
          <div className='relative'>
            <div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400'>
              <Mail className='h-4 w-4' />
            </div>
            <Input
              id='email'
              type='email'
              value={invitationData?.emailAddress || ''}
              className='w-full h-12 pl-10 bg-neutral-50 text-neutral-500 border-neutral-200'
              disabled={true}
              readOnly
            />
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='password' className='text-neutral-900 font-medium text-sm'>
            Mot de passe
          </Label>
          <PasswordInput
            id='password'
            placeholder='Entrez votre mot de passe'
            value={formState.values.password}
            onChange={handlePasswordChange}
            className={`w-full h-12 ${
              hasError('password')
                ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500'
                : 'border-neutral-200 focus:border-primary-200 focus:ring-primary-200'
            }`}
            disabled={isSubmitting}
            autoComplete='new-password'
            maxLength={128}
            required
            aria-invalid={hasError('password')}
            aria-describedby={hasError('password') ? 'password-error' : undefined}
          />
        </div>

        <div className='space-y-1'>
          <p className='text-xs text-neutral-500 mb-2'>Le mot de passe doit contenir :</p>
          <div className='grid grid-cols-2 gap-y-2'>
            <PasswordRequirement met={hasMinLength} text='8 caractères min.' />
            <PasswordRequirement met={hasUpperCase} text='1 majuscule' />
            <PasswordRequirement met={hasLowerCase} text='1 minuscule' />
            <PasswordRequirement met={hasNumber} text='1 chiffre' />
            <PasswordRequirement met={hasSpecial} text='1 caractère spécial' />
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='confirmPassword' className='text-neutral-900 font-medium text-sm'>
            Confirmer le mot de passe
          </Label>
          <PasswordInput
            id='confirmPassword'
            placeholder='Confirmez votre mot de passe'
            value={formState.values.confirmPassword}
            onChange={handleConfirmPasswordChange}
            className={`w-full h-12 ${
              hasError('confirmPassword')
                ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500'
                : 'border-neutral-200 focus:border-primary-200 focus:ring-primary-200'
            }`}
            disabled={isSubmitting}
            autoComplete='new-password'
            maxLength={128}
            required
            aria-invalid={hasError('confirmPassword')}
            aria-describedby={hasError('confirmPassword') ? 'confirmPassword-error' : undefined}
          />
          {hasError('confirmPassword') && (
            <div
              id='confirmPassword-error'
              className='text-red-500 text-xs mt-1'
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
          disabled={isSubmitting || !isFormValid}
          className={`w-full h-12 bg-primary-300 hover:bg-primary-300/90 text-white font-medium text-base rounded-md transition-all flex items-center justify-center gap-2 ${
            !isSubmitting && isFormValid ? 'cursor-pointer' : ''
          }`}
        >
          {isSubmitting ? (
            <>
              <div className='h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
              <span>Création en cours...</span>
            </>
          ) : (
            <>
              Créer mon mot de passe
              <ArrowRight className='h-4 w-4' />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
