'use client';

import { Phone, ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { InputField, SubmitButton } from '@/components/auth/FormComponents';
import { PasswordInput } from '@/components/password-input';
import { Label } from '@/components/ui/label';
import { useLogin, type LoginFormValues } from '@/hooks/login/useLogin';

export function LoginForm() {
  const initialValues: LoginFormValues = {
    email: '',
    password: '',
  };

  const {
    formState,
    hasError,
    getError,
    isFormValid,
    isLoading,
    error,
    isLoaded,
    handleFieldChange,
    handleLogin,
  } = useLogin(initialValues);

  return (
    <div className='w-full'>
      <div className='mb-6'>
        <h1 className='text-2xl font-semibold text-foreground mb-2 text-gray-700'>Bienvenue !</h1>
        <p className='text-muted-foreground text-sm text-gray-500'>Connectez-vous pour continuer</p>
      </div>

      <form onSubmit={handleLogin} className='space-y-5' noValidate>
        <InputField
          id='email'
          label='Email'
          type='email'
          placeholder='Votre email'
          value={formState.values.email as string}
          onChange={handleFieldChange('email')}
          hasError={hasError('email')}
          errorMessage={getError('email')}
          disabled={isLoading}
          autoComplete='email'
          maxLength={254}
          required
          icon={Phone}
        />

        <div className='space-y-2'>
          <Label htmlFor='password' className='text-foreground font-medium text-gray-700'>
            Mot de passe
          </Label>
          <PasswordInput
            id='password'
            placeholder='••••••••'
            value={formState.values.password as string}
            onChange={handleFieldChange('password')}
            className={`w-full h-12 bg-gray-50 border-gray-200 rounded-lg focus-visible:ring-primary-200 ${
              hasError('password')
                ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500'
                : ''
            }`}
            disabled={isLoading}
            autoComplete='current-password'
            maxLength={128}
            minLength={8}
            required
            aria-invalid={hasError('password')}
            aria-describedby={hasError('password') ? 'password-error' : undefined}
          />
          <div className='flex justify-end'>
            <Link
              href='/forgot-password'
              className='text-sm text-primary-300 cursor-pointer hover:text-primary-300/80 transition-colors text-gray-700'
            >
              Mot de passe oublié ?
            </Link>
          </div>
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

        <SubmitButton isLoading={isLoading} disabled={!isFormValid || !isLoaded}>
          {isLoading ? 'Connexion en cours...' : 'Se connecter'}
          <ArrowRight className='h-4 w-4' />
        </SubmitButton>
      </form>

      <div className='my-6'>
        <hr className='border-gray-100' />
      </div>

      <div className='text-center'>
        <p className='text-sm text-muted-foreground text-gray-500'>
          Pas encore de compte ?{' '}
          <Link
            href='/register'
            className='text-primary-300 font-semibold hover:text-primary-300/80 font-medium cursor-pointer transition-colors'
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
