'use client';

import { User, Phone, Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { PasswordInput } from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRegister, type RegisterFormValues } from '@/hooks/register/useRegister';

export function RegisterForm() {
  const initialValues: RegisterFormValues = {
    fullName: '',
    phone: '',
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
    handleRegistration,
  } = useRegister(initialValues);

  return (
    <div className='w-full'>
      <div className='mb-6'>
        <h1 className='text-2xl font-semibold text-foreground mb-2 text-gray-700'>
          Créer un compte
        </h1>
        <p className='text-muted-foreground text-sm text-gray-500'>
          Rejoignez Finance4All dès maintenant
        </p>
      </div>

      <form onSubmit={handleRegistration} className='space-y-5' noValidate>
        <div className='space-y-2'>
          <Label htmlFor='fullName' className='text-foreground font-medium text-gray-700'>
            Nom complet
          </Label>
          <div className='relative'>
            <User className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
            <Input
              id='fullName'
              type='text'
              placeholder='Amadou Diallo'
              value={formState.values.fullName as string}
              onChange={handleFieldChange('fullName')}
              className={`w-full h-12 pl-10 bg-gray-50 border-gray-200 rounded-lg focus-visible:ring-primary-200 ${
                hasError('fullName')
                  ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500'
                  : ''
              }`}
              disabled={isLoading}
              autoComplete='name'
              maxLength={100}
              required
              aria-invalid={hasError('fullName')}
              aria-describedby={hasError('fullName') ? 'fullName-error' : undefined}
            />
          </div>
          {hasError('fullName') && (
            <div
              id='fullName-error'
              className='text-red-500 text-sm font-medium'
              role='alert'
              aria-live='polite'
            >
              {getError('fullName')}
            </div>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='phone' className='text-foreground font-medium text-gray-700'>
            Téléphone
          </Label>
          <div className='relative'>
            <Phone className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
            <Input
              id='phone'
              type='tel'
              placeholder='+221 77 123 45 67'
              value={formState.values.phone as string}
              onChange={handleFieldChange('phone')}
              className={`w-full h-12 pl-10 bg-gray-50 border-gray-200 rounded-lg focus-visible:ring-primary-200 ${
                hasError('phone')
                  ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500'
                  : ''
              }`}
              disabled={isLoading}
              autoComplete='tel'
              maxLength={20}
              required
              aria-invalid={hasError('phone')}
              aria-describedby={hasError('phone') ? 'phone-error' : undefined}
            />
          </div>
          {hasError('phone') && (
            <div
              id='phone-error'
              className='text-red-500 text-sm font-medium'
              role='alert'
              aria-live='polite'
            >
              {getError('phone')}
            </div>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='email' className='text-foreground font-medium text-gray-700'>
            Email
          </Label>
          <div className='relative'>
            <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
            <Input
              id='email'
              type='email'
              placeholder='amadou@example.com'
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
            autoComplete='new-password'
            maxLength={128}
            minLength={6}
            required
            aria-invalid={hasError('password')}
            aria-describedby={hasError('password') ? 'password-error' : undefined}
          />
          <div className='text-sm text-gray-500'>Minimum 6 caractères</div>
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
          {isLoading ? 'Création en cours...' : 'Créer mon compte'}
          <ArrowRight className='h-4 w-4' />
        </Button>
      </form>

      <div className='my-6'>
        <hr className='border-gray-100' />
      </div>

      <div className='text-center space-y-3'>
        <p className='text-sm text-muted-foreground text-gray-500'>
          Déjà un compte ?{' '}
          <Link
            href='/login'
            className='text-primary-200 font-semibold hover:text-primary-300/80 font-medium cursor-pointer transition-colors'
          >
            Se connecter
          </Link>
        </p>
        <p className='text-xs text-gray-400'>
          En vous inscrivant, vous acceptez les{' '}
          <Link
            href='/terms'
            className='text-primary-200 hover:text-primary-300/80 transition-colors'
          >
            Conditions Générales
          </Link>{' '}
          et la{' '}
          <Link
            href='/privacy'
            className='text-primary-200 hover:text-primary-300/80 transition-colors'
          >
            Politique de confidentialité
          </Link>
        </p>
      </div>
    </div>
  );
}
