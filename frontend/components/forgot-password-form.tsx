'use client';

import { Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useEffect } from 'react';

import { PasswordInput } from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import {
  useForgotPassword,
  type ForgotPasswordFormValues,
} from '@/hooks/forgot-password/useForgotPassword';

export function ForgotPasswordForm() {
  const initialValues: ForgotPasswordFormValues = {
    email: '',
    password: '',
    code: '',
  };

  const {
    formState,
    hasError,
    getError,
    isFormValid,
    step,
    setStep,
    isLoading,
    error,
    success,
    successMessage,
    handleEmailChange,
    handlePasswordChange,
    handleCodeChange,
    handleSendResetLink,
    handleResetPassword,
    handleResetForm,
    handlePreviousStep,
  } = useForgotPassword(initialValues);

  useEffect(() => {
    return () => {
      handlePreviousStep();
    };
  }, [handlePreviousStep]);

  // Gérer le passage à l'étape 2 quand l'envoi réussit
  useEffect(() => {
    if (success && step === 1) {
      setStep(2);
    }
  }, [success, step, setStep]);

  const buttonText = useMemo(() => {
    if (isLoading) {
      return step === 1 ? 'Envoi en cours...' : 'Réinitialisation en cours...';
    }
    if (success) {
      return step === 1 ? 'Lien envoyé !' : 'Réinitialiser le mot de passe';
    }
    return step === 1 ? 'Envoyer le lien de réinitialisation' : 'Réinitialiser le mot de passe';
  }, [isLoading, success, step]);

  return (
    <div className='w-full'>
      <div className='mb-6'>
        <h1 className='text-2xl font-semibold text-foreground mb-2 text-gray-700'>
          Mot de passe oublié ?
        </h1>
        <p className='text-muted-foreground text-sm text-gray-500'>
          Entrez votre email pour réinitialiser
        </p>
      </div>

      {step === 1 ? (
        <form onSubmit={handleSendResetLink} className='space-y-5' noValidate>
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
                onChange={handleEmailChange}
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

          {success && successMessage && (
            <div
              className='text-green-600 text-sm font-medium bg-green-50 p-3 rounded-md border border-green-200'
              role='alert'
              aria-live='polite'
              aria-atomic='true'
            >
              {successMessage}
            </div>
          )}

          <Button
            type='submit'
            disabled={isLoading || success || !isFormValid}
            className='w-full h-12 bg-primary-200 hover:bg-primary-300/90 text-white font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg flex items-center justify-center gap-2'
          >
            {buttonText}
            <ArrowRight className='h-4 w-4' />
          </Button>

          <div className='my-6'>
            <hr className='border-gray-100' />
          </div>

          <div className='text-center'>
            <Link
              href='/login'
              className='text-sm text-primary-200 font-semibold hover:text-primary-300/80 font-medium cursor-pointer transition-colors'
            >
              Retour à la connexion
            </Link>
          </div>

          {success && (
            <div className='mt-4 text-center'>
              <button
                type='button'
                onClick={handleResetForm}
                className='text-primary-200 hover:text-primary-300 text-sm font-medium transition-colors underline'
              >
                Renvoyer le lien de réinitialisation
              </button>
            </div>
          )}
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className='space-y-5' noValidate>
          <div className='space-y-2'>
            <Label htmlFor='password' className='text-foreground font-medium text-gray-700'>
              Nouveau mot de passe
            </Label>
            <PasswordInput
              id='password'
              placeholder='••••••••'
              value={formState.values.password as string}
              onChange={handlePasswordChange}
              className={`w-full h-12 bg-gray-50 border-gray-200 rounded-lg focus-visible:ring-primary-200 ${
                hasError('password')
                  ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500'
                  : ''
              }`}
              disabled={isLoading}
              autoComplete='new-password'
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
            <Label htmlFor='code' className='text-foreground font-medium text-gray-700'>
              Code de réinitialisation
            </Label>
            <InputOTP
              value={formState.values.code as string}
              onChange={handleCodeChange}
              maxLength={6}
              containerClassName='justify-center'
            >
              <InputOTPGroup className='gap-3 w-full justify-center'>
                {Array.from({ length: 6 }, (_, index) => (
                  <InputOTPSlot
                    key={`otp-slot-${index}`}
                    index={index}
                    className='h-12 text-base w-full border rounded-lg bg-gray-50 border-gray-200 focus-visible:border-primary-200 focus-visible:ring-primary-200'
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
            {hasError('code') && (
              <div className='text-red-500 text-sm font-medium' role='alert' aria-live='polite'>
                {getError('code')}
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
            className='w-full h-12 bg-primary-200 hover:bg-primary-300/90 text-white font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg flex items-center justify-center gap-2'
          >
            {buttonText}
            <ArrowRight className='h-4 w-4' />
          </Button>
        </form>
      )}

      {step === 2 && (
        <>
          <div className='my-6'>
            <hr className='border-gray-100' />
          </div>
          <div className='text-center'>
            <button
              onClick={handlePreviousStep}
              className='text-primary-200 hover:text-primary-300 text-sm font-medium transition-colors'
            >
              ← Précédent
            </button>
          </div>
        </>
      )}
    </div>
  );
}
