'use client';

import { Phone, ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { PasswordInput } from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
        <div className='space-y-2'>
          <Label htmlFor='email' className='text-foreground font-medium text-gray-700'>
            Email
          </Label>
          <div className='relative'>
            <Phone className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
            <Input
              id='email'
              type='email'
              placeholder='Votre email'
              value={formState.values.email as string}
              onChange={handleFieldChange('email')}
              className={`w-full h-12 pl-10 bg-gray-50 border-gray-200 rounded-lg focus-visible:ring-primary-200 ${
                hasError('email')
                  ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500'
                  : ''
              }`}
              disabled={isLoading}
              autoComplete='email'
              maxLength={254}
              required
              aria-invalid={hasError('email')}
              aria-describedby={hasError('email') ? 'email-error' : undefined}
            />
          </div>
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
              className='text-sm text-primary-200 cursor-pointer hover:text-primary-300/80 transition-colors text-gray-700'
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

        <Button
          type='submit'
          disabled={isLoading || !isFormValid || !isLoaded}
          className='w-full h-12 bg-primary-200 hover:bg-primary-300/90 text-white font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg flex items-center justify-center gap-2'
        >
          {isLoading ? 'Connexion en cours...' : 'Se connecter'}
          <ArrowRight className='h-4 w-4' />
        </Button>
      </form>

      <div className='my-6'>
        <hr className='border-gray-100' />
      </div>

      <div className='text-center'>
        <p className='text-sm text-muted-foreground text-gray-500'>
          Pas encore de compte ?{' '}
          <Link
            href='/register'
            className='text-primary-200 font-semibold hover:text-primary-300/80 font-medium cursor-pointer transition-colors'
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
