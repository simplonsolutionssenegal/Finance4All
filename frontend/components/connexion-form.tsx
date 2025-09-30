'use client';

import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

import { PasswordInput } from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormState } from '@/hooks/useFormState';

interface ConnexionFormValues extends Record<string, unknown> {
  email: string;
  password: string;
}

export function ConnexionForm() {
  const initialValues: ConnexionFormValues = {
    email: '',
    password: '',
  };

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { isLoaded, signIn, setActive } = useSignIn();

  const { formState, updateField, hasError, getError } = useFormState(initialValues);

  const resetState = useCallback(() => {
    setError(null);
  }, []);

  const isFormValid = useMemo(() => {
    return (
      (formState.values.email as string).trim() !== '' &&
      !hasError('email') &&
      (formState.values.password as string).trim() !== '' &&
      !hasError('password')
    );
  }, [formState, hasError]);

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateField('email', e.target.value);
      if (error) {
        resetState();
      }
    },
    [updateField, error, resetState]
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

  const handleConnection = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!isLoaded || !signIn) return;
      if (!isFormValid) return;

      setIsLoading(true);
      setError(null);

      try {
        const signInAttempt = await signIn.create({
          identifier: formState.values.email as string,
          password: formState.values.password as string,
        });

        if (signInAttempt.status === 'complete') {
          await setActive({ session: signInAttempt.createdSessionId });
          router.push('/dashboard');
        } else {
          setError("Une erreur s'est produite lors de la connexion. Veuillez réessayer.");
        }
      } catch (err: unknown) {
        // console.error('Erreur de connexion:', err);

        let errorMessage = "Une erreur s'est produite lors de la connexion.";

        if (err && typeof err === 'object' && 'errors' in err) {
          const clerkError = (err as { errors: Array<{ code: string; message?: string }> })
            .errors[0];
          if (clerkError) {
            switch (clerkError.code) {
              case 'form_identifier_not_found':
                errorMessage = 'Email non trouvé. Vérifiez votre adresse email.';
                break;
              case 'form_password_incorrect':
                errorMessage = 'Mot de passe incorrect.';
                break;
              case 'form_identifier_exists':
                errorMessage = 'Cet email est déjà utilisé.';
                break;
              default:
                errorMessage = clerkError.message || errorMessage;
            }
          }
        }

        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoaded, signIn, setActive, isFormValid, formState.values, router]
  );

  return (
    <div className='max-w-md w-full mx-auto'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-neutral-500 mb-2'>Connexion Administration</h1>
        <p className='text-neutral-400 text-sm'>Connectez vous à votre compte</p>
      </div>

      <form onSubmit={handleConnection} className='space-y-6' noValidate>
        <div className='space-y-2'>
          <Label htmlFor='email' className='text-neutral-500 font-bold'>
            Email*
          </Label>
          <Input
            id='email'
            type='email'
            placeholder='Votre email'
            value={formState.values.email as string}
            onChange={handleEmailChange}
            className={`w-full h-12 ${
              hasError('email')
                ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500'
                : 'border-neutral-400 focus:border-primary-200 focus:ring-primary-200'
            }`}
            disabled={isLoading}
            autoComplete='email'
            maxLength={254}
            required
            aria-invalid={hasError('email')}
            aria-describedby={hasError('email') ? 'email-error' : undefined}
          />
          {hasError('email') && (
            <div
              id='email-error'
              className='text-red-500 text-sm font-medium'
              role='alert'
              aria-live='polite'
            >
              {getError('email')}
            </div>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='password' className='text-neutral-500 font-bold'>
            Mot de passe*
          </Label>
          <PasswordInput
            id='password'
            placeholder='Mot de passe'
            value={formState.values.password as string}
            onChange={handlePasswordChange}
            className={`w-full h-12 ${
              hasError('password')
                ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500'
                : 'border-neutral-400 focus:border-primary-200 focus:ring-primary-200'
            }`}
            disabled={isLoading}
            autoComplete='password'
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
          disabled={isLoading || !isFormValid || !isLoaded}
          className='w-full h-12 bg-primary-300 hover:bg-primary-300 text-white font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        >
          {isLoading ? 'Connexion en cours...' : 'Connexion'}
        </Button>
      </form>
    </div>
  );
}
