import type { LucideIcon } from 'lucide-react';
import { useMemo, type FormEventHandler } from 'react';

import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

interface OtpVerificationCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  email: string;
  code: string;
  otpLength?: number;
  onCodeChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  onBack: () => void;
  backLabel: string;
  onResend: () => void | Promise<void>;
  resendLabel: string;
  isSubmitting: boolean;
  submitLabel: string;
  loadingLabel?: string;
  isSubmitDisabled?: boolean;
  errorMessage?: string | null;
  backDisabled?: boolean;
  resendDisabled?: boolean;
  isResending?: boolean;
  codeError?: string | null;
  showResendHelper?: boolean;
}

export function OtpVerificationCard({
  icon: Icon,
  title,
  description,
  email,
  code,
  otpLength = 6,
  onCodeChange,
  onSubmit,
  onBack,
  backLabel,
  onResend,
  resendLabel,
  isSubmitting,
  submitLabel,
  loadingLabel = 'Vérification...',
  isSubmitDisabled,
  errorMessage,
  backDisabled = false,
  resendDisabled = false,
  isResending = false,
  codeError,
  showResendHelper = true,
}: OtpVerificationCardProps) {
  const isButtonDisabled = useMemo(() => {
    if (typeof isSubmitDisabled === 'boolean') {
      return isSubmitDisabled || isSubmitting;
    }
    return isSubmitting;
  }, [isSubmitDisabled, isSubmitting]);

  const hasCodeError = Boolean(codeError);

  const handleFormSubmit: FormEventHandler<HTMLFormElement> = event => {
    void onSubmit(event);
  };

  const handleResendClick = () => {
    void onResend();
  };

  return (
    <form onSubmit={handleFormSubmit} className='space-y-6' noValidate>
      <div className='flex flex-col items-center text-center space-y-3'>
        <div className='flex size-14 items-center justify-center rounded-lg bg-primary-50 text-primary-400'>
          <Icon className='size-7' />
        </div>
        <div>
          <h2 className='text-xl font-semibold text-gray-800'>{title}</h2>
          <p className='mt-2 text-sm text-gray-500'>
            {description} <span className='font-semibold text-gray-700'>{email}</span>
          </p>
        </div>
        <p className='text-sm text-gray-500'>Entrez le code à {otpLength} chiffres</p>
      </div>

      <div className='flex justify-center'>
        <InputOTP
          value={code}
          onChange={onCodeChange}
          maxLength={otpLength}
          containerClassName='justify-center'
        >
          <InputOTPGroup className='gap-3 w-full justify-center'>
            {Array.from({ length: otpLength }, (_, index) => (
              <InputOTPSlot
                key={`otp-slot-${index}`}
                index={index}
                className={`h-12 w-12 rounded-lg border bg-gray-50 text-center text-lg font-medium focus-visible:border-primary-200 focus-visible:ring-primary-200 ${
                  hasCodeError
                    ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200'
                    : 'border-gray-200'
                }`}
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      {codeError && (
        <p className='text-center text-sm font-medium text-red-500' role='alert' aria-live='polite'>
          {codeError}
        </p>
      )}

      {errorMessage && (
        <div
          className='rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600'
          role='alert'
          aria-live='polite'
          aria-atomic='true'
        >
          {errorMessage}
        </div>
      )}

      <Button
        type='submit'
        className='h-12 w-full rounded-lg bg-primary-300 text-base font-semibold text-white hover:bg-primary-300/90'
        disabled={isButtonDisabled}
      >
        {isSubmitting ? (
          <span className='flex items-center gap-2'>
            <span className='inline-flex size-4 animate-spin rounded-full border-2 border-white border-b-transparent' />
            <span>{loadingLabel}</span>
          </span>
        ) : (
          submitLabel
        )}
      </Button>

      <Button
        type='button'
        variant='ghost'
        className='h-10 w-full text-sm font-semibold text-gray-700 cursor-pointer hover:text-primary-300/80'
        onClick={onBack}
        disabled={backDisabled || isSubmitting}
      >
        {backLabel}
      </Button>

      {showResendHelper && (
        <p className='text-center text-sm text-gray-500'>
          Code non reçu ?{' '}
          <button
            type='button'
            onClick={handleResendClick}
            className='font-semibold text-primary-300 hover:text-primary-300/80 disabled:opacity-50 disabled:cursor-not-allowed'
            disabled={resendDisabled || isSubmitting || isResending}
          >
            {isResending ? (
              <span className='flex items-center gap-2'>
                <span className='inline-flex size-3 animate-spin rounded-full border-2 border-primary-300 border-b-transparent' />
                <span>Envoi en cours...</span>
              </span>
            ) : (
              resendLabel
            )}
          </button>
        </p>
      )}
    </form>
  );
}
