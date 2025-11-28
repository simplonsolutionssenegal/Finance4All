'use client';

import { Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useEffect } from 'react';

import { InputField, SubmitButton } from '@/components/auth/FormComponents';
import { OtpVerificationCard } from '@/components/auth/OtpVerificationCard';
import { SocialAuthButton } from '@/components/social-auth-button';
import { useSocialAuth } from '@/hooks/auth/useSocialAuth';
import { useLogin, type LoginFormValues } from '@/hooks/login/useLogin';

export function LoginForm() {
  const initialValues: LoginFormValues = {
    email: '',
    code: '',
  };

  const {
    formState,
    hasError,
    getError,
    isFormValid,
    isLoading,
    error,
    isLoaded,
    success,
    successMessage,
    isResending,
    step,
    setStep,
    handleFieldChange,
    handleCodeChange,
    handleSendOTP,
    handleVerifyOTP,
    handlePreviousStep,
    handleResendCode,
  } = useLogin(initialValues);

  const {
    handleSocialAuth,
    isLoaded: signInLoaded,
    error: socialError,
    isLoading: socialLoading,
  } = useSocialAuth('login');

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
      return step === 1 ? 'Envoi en cours...' : 'Vérification en cours...';
    }
    if (success && step === 1) {
      return 'Code envoyé !';
    }
    return step === 1 ? 'Recevoir le code OTP' : 'Se connecter';
  }, [isLoading, success, step]);

  return (
    <div className='w-full'>
      {step === 1 && (
        <div className='mb-6'>
          <h1 className='text-2xl font-semibold text-foreground mb-2 text-gray-700'>Bienvenue !</h1>

          <p className='text-muted-foreground text-sm text-gray-500'>
            Connectez-vous avec votre adresse email
          </p>
        </div>
      )}

      {step === 1 ? (
        <>
          <form onSubmit={handleSendOTP} className='space-y-5' noValidate>
            <InputField
              id='email'
              label='Adresse email'
              type='email'
              placeholder='votre@email.com'
              value={formState.values.email as string}
              onChange={handleFieldChange('email')}
              hasError={hasError('email')}
              errorMessage={getError('email')}
              disabled={isLoading}
              autoComplete='email'
              maxLength={254}
              required
              icon={Mail}
            />

            {error ||
              (socialError && (
                <div
                  className='text-red-500 text-sm font-medium bg-red-50 p-3 rounded-md border border-red-200'
                  role='alert'
                  aria-live='polite'
                  aria-atomic='true'
                >
                  {error || socialError}
                </div>
              ))}

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

            <SubmitButton isLoading={isLoading} disabled={!isFormValid || !isLoaded || success}>
              {buttonText}
              <ArrowRight className='h-4 w-4' />
            </SubmitButton>
          </form>

          {/* Séparateur */}
          <div className='my-6 relative'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-gray-200' />
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-2 bg-white text-gray-500'>Ou continuer avec</span>
            </div>
          </div>

          {/* Boutons sociaux */}
          <div className='space-y-3'>
            <SocialAuthButton
              provider='google'
              mode='login'
              onClick={() => handleSocialAuth('google')}
              disabled={!signInLoaded || socialLoading}
            />
            <SocialAuthButton
              provider='facebook'
              mode='login'
              onClick={() => handleSocialAuth('facebook')}
              disabled={!signInLoaded || socialLoading}
            />
            <SocialAuthButton
              provider='apple'
              mode='login'
              onClick={() => handleSocialAuth('apple')}
              disabled={!signInLoaded || socialLoading}
            />
          </div>
        </>
      ) : (
        <OtpVerificationCard
          icon={Mail}
          title="Vérification de l'email"
          description='Un code a été envoyé à'
          email={formState.values.email as string}
          code={formState.values.code as string}
          onCodeChange={handleCodeChange}
          onSubmit={handleVerifyOTP}
          onBack={handlePreviousStep}
          backLabel="Modifier l'email"
          onResend={() => void handleResendCode()}
          resendLabel='Renvoyer le code'
          isSubmitting={isLoading}
          isResending={isResending}
          submitLabel='Se connecter'
          loadingLabel='Vérification...'
          isSubmitDisabled={
            (formState.values.code as string).trim().length !== 6 || hasError('code')
          }
          errorMessage={error}
          resendDisabled={isLoading}
          backDisabled={isLoading}
          codeError={hasError('code') ? getError('code') : null}
          showResendHelper={false}
        />
      )}
      {step === 1 ? (
        <div className='my-6'>
          <hr className='border-gray-100' />
        </div>
      ) : null}

      {step === 1 ? (
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
      ) : (
        <div className='text-center'>
          <p className='text-sm text-muted-foreground text-gray-500'>
            Code non reçu ?{' '}
            <button
              type='button'
              onClick={handleResendCode}
              className='text-primary-300 cursor-pointer font-semibold hover:text-primary-300/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={isResending || isLoading}
            >
              {isResending ? (
                <span className='flex items-center gap-2'>
                  <span className='inline-flex size-3 animate-spin rounded-full border-2 border-primary-300 border-b-transparent' />
                  <span>Envoi en cours...</span>
                </span>
              ) : (
                'Renvoyer le code'
              )}
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
