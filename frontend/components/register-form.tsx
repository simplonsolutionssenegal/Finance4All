'use client';

import { User, Phone, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';

import { PasswordInput } from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { useRegister, type RegisterFormValues } from '@/hooks/register/useRegister';

export function RegisterForm() {
  const [step, setStep] = useState(1); // 1: Saisie des informations, 2: Vérification email
  const [verificationCode, setVerificationCode] = useState('');
  const [allowBackToStep1, setAllowBackToStep1] = useState(false);

  const initialValues: RegisterFormValues = {
    firstName: '',
    lastName: '',
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
    isOtpVerification,
    verificationError,
    isVerifying,
    handleFieldChange,
    handleRegistration,
    handleVerification,
    handleResendCode,
  } = useRegister(initialValues);

  // Passer à l'étape 2 si la vérification OTP est nécessaire
  React.useEffect(() => {
    if (isOtpVerification && step === 1 && !allowBackToStep1) {
      setStep(2);
    }
  }, [isOtpVerification, step, allowBackToStep1]);

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
      <div className='mb-6'>
        <h1 className='text-2xl font-semibold text-foreground mb-2 text-gray-700'>
          {step === 1 ? 'Créer un compte' : "Vérification de l'email"}
        </h1>
        <p className='text-muted-foreground text-sm text-gray-500'>
          {step === 1
            ? 'Rejoignez Finance4All dès maintenant'
            : 'Entrez le code de vérification envoyé à votre adresse email'}
        </p>
      </div>

      {step === 1 ? (
        // ÉTAPE 1: Saisie des informations
        <>
          <form onSubmit={handleRegistration} className='space-y-5' noValidate>
            {/* Prénom et Nom sur la même ligne */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
                  Nom de famille
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
        </>
      ) : (
        // ÉTAPE 2: Vérification du code email
        <form onSubmit={handleVerificationSubmit} className='space-y-5' noValidate>
          {/* Code de vérification */}
          <div className='space-y-2'>
            <Label htmlFor='code' className='text-foreground font-medium text-gray-700'>
              Code de vérification
            </Label>
            <InputOTP
              value={verificationCode}
              onChange={setVerificationCode}
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
          </div>

          {/* Message d'erreur */}
          {(error || verificationError) && (
            <div className='p-3 bg-red-50 border border-red-200 rounded-md'>
              <p className='text-sm text-red-600'>{verificationError || error}</p>
            </div>
          )}

          {/* Bouton de vérification */}
          <Button
            type='submit'
            disabled={!verificationCode.trim() || isVerifying}
            className='w-full h-12 bg-primary-200 hover:bg-primary-300/90 text-white font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg flex items-center justify-center gap-2'
          >
            {isVerifying ? (
              <div className='flex items-center space-x-2'>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white' />
                <span>Vérification...</span>
              </div>
            ) : (
              <div className='flex items-center space-x-2'>
                <span>Vérifier le code</span>
                <ArrowRight className='h-4 w-4' />
              </div>
            )}
          </Button>

          {/* Boutons d'action */}
          <div className='space-y-3'>
            {/* Bouton retour */}
            <Button
              type='button'
              variant='outline'
              className='w-full h-12 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors rounded-lg flex items-center justify-center gap-2'
              onClick={handleBackToStep1}
              disabled={isVerifying}
            >
              <ArrowLeft className='h-4 w-4' />
              Retour
            </Button>

            {/* Bouton renvoyer */}
            <Button
              type='button'
              variant='outline'
              className='w-full h-12 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors rounded-lg flex items-center justify-center gap-2'
              onClick={handleResendCode}
              disabled={isVerifying}
            >
              Renvoyer le code
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
