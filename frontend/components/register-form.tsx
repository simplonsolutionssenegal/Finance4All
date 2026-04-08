'use client';

import { User, Mail, Phone, ArrowRight, MailCheck } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';

import { OtpVerificationCard } from '@/components/auth/OtpVerificationCard';
import { SocialAuthButton } from '@/components/social-auth-button';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRegisterFormStep } from '@/contexts/register-form-context';
import { useSocialAuth } from '@/hooks/auth/useSocialAuth';
import {
  useCreateBeneficiary,
  type CreateBeneficiaryFormValues,
} from '@/hooks/beneficiary/useCreateBeneficiary';

export function RegisterForm() {
  const { step, setStep } = useRegisterFormStep();
  const [verificationCode, setVerificationCode] = useState('');
  const [allowBackToStep1, setAllowBackToStep1] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const initialValues: CreateBeneficiaryFormValues = {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  };

  const {
    formState,
    hasError,
    getError,
    isFormValid,
    isLoading,
    error,
    isLoaded,
    isOtpVerification,
    verificationError,
    isVerifying,
    isResending,
    verificationStrategy,
    verificationTarget,
    handleFieldChange,
    handleCreateBeneficiary,
    handleVerification,
    handleResendCode,
  } = useCreateBeneficiary(initialValues);

  const {
    handleSocialAuth,
    isLoaded: signInLoaded,
    error: socialError,
    isLoading: socialLoading,
  } = useSocialAuth('register');

  // Passer à l'étape 2 si la vérification OTP est nécessaire
  React.useEffect(() => {
    if (isOtpVerification && step === 1 && !allowBackToStep1) {
      setStep(2);
    }
  }, [isOtpVerification, step, allowBackToStep1]);

  React.useEffect(() => {
    setVerificationCode('');
  }, [verificationStrategy]);

  const handleBackToStep1 = () => {
    setAllowBackToStep1(true);
    setStep(1);
    setVerificationCode('');
  };

  const handleVerificationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleVerification(verificationCode);
  };

  return (
    <div className='w-full'>
      {step === 1 && (
        <div className='mb-6'>
          <h1 className='text-2xl font-semibold text-foreground mb-2 text-gray-700'>
            Créer votre compte
          </h1>
          <p className='text-muted-foreground text-sm text-gray-500'>
            Connexion sécurisée par OTP (SMS & Email)
          </p>
        </div>
      )}

      {step === 1 ? (
        // ÉTAPE 1: Saisie des informations
        <>
          <form onSubmit={handleCreateBeneficiary} className='space-y-5' noValidate>
            {/* Prénom */}
            <div className='space-y-2'>
              <Label htmlFor='firstName' className='text-foreground font-medium text-gray-700'>
                Prénom
              </Label>
              <div className='relative'>
                <User className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
                <Input
                  id='firstName'
                  type='text'
                  placeholder='Amadou'
                  value={formState.values.firstName as string}
                  onChange={handleFieldChange('firstName')}
                  className={`w-full h-12 pl-10 bg-gray-50 border-gray-200 rounded-lg focus-visible:ring-primary-200 ${
                    hasError('firstName')
                      ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500'
                      : ''
                  }`}
                  disabled={isLoading}
                  autoComplete='given-name'
                  maxLength={50}
                  required
                  aria-invalid={hasError('firstName')}
                  aria-describedby={hasError('firstName') ? 'firstName-error' : undefined}
                />
              </div>
              {hasError('firstName') && (
                <div
                  id='firstName-error'
                  className='text-red-500 text-sm font-medium'
                  role='alert'
                  aria-live='polite'
                >
                  {getError('firstName')}
                </div>
              )}
            </div>

            {/* Nom de famille */}
            <div className='space-y-2'>
              <Label htmlFor='lastName' className='text-foreground font-medium text-gray-700'>
                Nom
              </Label>
              <div className='relative'>
                <User className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
                <Input
                  id='lastName'
                  type='text'
                  placeholder='Diallo'
                  value={formState.values.lastName as string}
                  onChange={handleFieldChange('lastName')}
                  className={`w-full h-12 pl-10 bg-gray-50 border-gray-200 rounded-lg focus-visible:ring-primary-200 ${
                    hasError('lastName')
                      ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500'
                      : ''
                  }`}
                  disabled={isLoading}
                  autoComplete='family-name'
                  maxLength={50}
                  required
                  aria-invalid={hasError('lastName')}
                  aria-describedby={hasError('lastName') ? 'lastName-error' : undefined}
                />
              </div>
              {hasError('lastName') && (
                <div
                  id='lastName-error'
                  className='text-red-500 text-sm font-medium'
                  role='alert'
                  aria-live='polite'
                >
                  {getError('lastName')}
                </div>
              )}
            </div>

            {/* Numéro de téléphone */}
            <div className='space-y-2'>
              <Label htmlFor='phone' className='text-foreground font-medium text-gray-700'>
                Téléphone
              </Label>
              <div className='relative'>
                <Phone className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
                <Input
                  id='phone'
                  type='tel'
                  placeholder='+221771234567'
                  value={formState.values.phone as string}
                  onChange={handleFieldChange('phone')}
                  className={`w-full h-12 pl-10 bg-gray-50 border-gray-200 rounded-lg focus-visible:ring-primary-200 ${
                    hasError('phone')
                      ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500'
                      : ''
                  }`}
                  disabled={isLoading}
                  autoComplete='tel'
                  inputMode='tel'
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

            {(error || socialError) && (
              <div
                className='text-red-500 text-sm font-medium bg-red-50 p-3 rounded-md border border-red-200'
                role='alert'
                aria-live='polite'
                aria-atomic='true'
              >
                {error || socialError}
              </div>
            )}

            {/* Policy Acceptance Checkbox */}
            <div className='flex items-start gap-3'>
              <Checkbox
                id='acceptTerms'
                checked={acceptedTerms}
                onCheckedChange={checked => setAcceptedTerms(checked === true)}
                disabled={isLoading}
                className='mt-0.5'
                aria-describedby='acceptTerms-label'
              />
              <label
                htmlFor='acceptTerms'
                id='acceptTerms-label'
                className='text-sm text-gray-600 cursor-pointer leading-snug'
              >
                J&apos;accepte les{' '}
                <Link
                  href='/terms'
                  className='text-primary-300 font-semibold hover:text-primary-300/80 transition-colors'
                  onClick={e => e.stopPropagation()}
                >
                  Conditions d&apos;utilisation
                </Link>{' '}
                et la{' '}
                <Link
                  href='/privacy'
                  className='text-primary-300 font-semibold hover:text-primary-300/80 transition-colors'
                  onClick={e => e.stopPropagation()}
                >
                  Politique de confidentialité
                </Link>
              </label>
            </div>

            <Button
              type='submit'
              disabled={isLoading || !isFormValid || !isLoaded || !acceptedTerms}
              className='w-full h-12 bg-primary-300 hover:bg-primary-300/90 text-white font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg flex items-center justify-center gap-2'
            >
              {isLoading ? 'Création en cours...' : 'Créer mon compte'}
              <ArrowRight className='h-4 w-4' />
            </Button>
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

          {/* Boutons des réseaux sociaux */}
          <div className='space-y-3'>
            <SocialAuthButton
              provider='google'
              mode='register'
              onClick={() => handleSocialAuth('google')}
              disabled={!signInLoaded || socialLoading}
            />
            <SocialAuthButton
              provider='facebook'
              mode='register'
              onClick={() => handleSocialAuth('facebook')}
              disabled={!signInLoaded || socialLoading}
            />
            <SocialAuthButton
              provider='apple'
              mode='register'
              onClick={() => handleSocialAuth('apple')}
              disabled={!signInLoaded || socialLoading}
            />
          </div>
        </>
      ) : (
        // ÉTAPE 2: Vérification du code OTP
        <OtpVerificationCard
          icon={MailCheck}
          title="Vérification de l'Email"
          description='Un code a été envoyé à'
          email={verificationTarget || (formState.values.email as string)}
          code={verificationCode}
          onCodeChange={setVerificationCode}
          onSubmit={handleVerificationSubmit}
          onBack={handleBackToStep1}
          backLabel='Retour au formulaire'
          onResend={() => void handleResendCode()}
          resendLabel='Renvoyer le code'
          isSubmitting={isVerifying}
          isResending={isResending}
          submitLabel='Vérifier le code'
          loadingLabel='Vérification...'
          isSubmitDisabled={verificationCode.trim().length !== 6}
          errorMessage={verificationError || error}
          resendDisabled={isVerifying}
          backDisabled={isVerifying}
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
            Déjà un compte ?{' '}
            <Link
              href='/login'
              className='text-primary-300 font-semibold hover:text-primary-300/80 font-medium cursor-pointer transition-colors'
            >
              Se connecter
            </Link>
          </p>
        </div>
      ) : (
        <>
          <div className='my-6'>
            <hr className='border-gray-100' />
          </div>
          <div className='text-center'>
            <p className='text-sm text-muted-foreground text-gray-500'>
              Code non reçu ?{' '}
              <button
                type='button'
                onClick={() => void handleResendCode()}
                className='text-primary-300 cursor-pointer font-semibold hover:text-primary-300/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                disabled={isResending || isVerifying}
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
        </>
      )}
    </div>
  );
}
