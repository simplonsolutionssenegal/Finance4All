"use client";

import Image from "next/image";
import { useState, useCallback, useMemo, useEffect } from "react";

import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { useForgotPassword } from "@/hooks/useForgotPassword";
import { useFormState } from "@/hooks/useFormState";
import { validateEmail, validatePassword, validateOTPCode } from "@/lib/validation";

interface ForgotPasswordFormValues extends Record<string, unknown> {
  email: string;
  password: string;
  code: string;
}

export default function ForgotPassword() {
  const [step, setStep] = useState(1);

  const initialValues: ForgotPasswordFormValues = {
    email: "",
    password: "",
    code: ""
  };

  const {
    formState,
    updateField,
    setFieldError,
    resetForm,
    hasError,
    getError
  } = useFormState(initialValues);

  const { isLoading, error, success, successMessage, sendResetLink, resetPassword, resetState } = useForgotPassword();

  useEffect(() => {
    return () => {
      resetState();
    };
  }, [resetState]);

  // Gérer le passage à l'étape 2 quand l'envoi réussit
  useEffect(() => {
    if (success && step === 1) {
      setStep(2);
    }
  }, [success, step]);

  const isFormValid = useMemo(() => {
    if (step === 1) {
      return (formState.values.email as string).trim() !== "" && !hasError('email');
    }
    return (formState.values.password as string).trim() !== "" &&
      (formState.values.code as string).trim() !== "" &&
      !hasError('password') &&
      !hasError('code');
  }, [formState, step, hasError]);

  const buttonText = useMemo(() => {
    if (isLoading) {
      return step === 1 ? "Envoi en cours..." : "Réinitialisation en cours...";
    }
    if (success) {
      return step === 1 ? "Lien envoyé !" : "Mot de passe réinitialisé !";
    }
    return step === 1 ? "Envoyer le lien de réinitialisation" : "Réinitialiser le mot de passe";
  }, [isLoading, success, step]);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateField('email', e.target.value);
    if (error) {
      resetState();
    }
  }, [updateField, error, resetState]);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateField('password', e.target.value);
    if (error) {
      resetState();
    }
  }, [updateField, error, resetState]);

  const handleCodeChange = useCallback((value: string) => {
    updateField('code', value);
    if (error) {
      resetState();
    }
  }, [updateField, error, resetState]);

  const handleSendResetLink = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const emailValidationError = validateEmail(formState.values.email as string);
    if (emailValidationError) {
      setFieldError('email', emailValidationError);
      return;
    }

    try {
      await sendResetLink(formState.values.email as string);
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
    }
  }, [formState.values.email, sendResetLink, setFieldError]);

  const handleResetPassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordValidationError = validatePassword(formState.values.password as string);
    if (passwordValidationError) {
      setFieldError('password', passwordValidationError);
      return;
    }

    const codeValidationError = validateOTPCode(formState.values.code as string);
    if (codeValidationError) {
      setFieldError('code', codeValidationError);
      return;
    }

    await resetPassword(formState.values.password as string, formState.values.code as string);
  }, [formState.values.password, formState.values.code, resetPassword, setFieldError]);

  const handleResetForm = useCallback(() => {
    resetForm();
    resetState();
    setStep(1);
  }, [resetForm, resetState]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Section gauche */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-400 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/assets/images/login-bg.png"
            alt="Background image"
            fill
            className="object-cover opacity-50"
            priority
            sizes="(max-width: 1024px) 0px, 50vw"
          />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Réinitialisez votre mot de passe
          </h1>
          <p className="text-lg text-white/90 leading-relaxed">
            Pas d&apos;inquiétude, ça arrive à tout le monde ! Indiquez simplement l&apos;adresse e-mail associée à votre compte, et nous vous enverrons un lien pour créer un nouveau mot de passe.
          </p>
        </div>
      </div>

      {/* Section droite */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12 lg:py-0">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-8">
            <Image
              src="/logo.svg"
              alt="Finance4All Logo"
              width={200}
              height={60}
              className="h-12 w-auto"
              priority
            />
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-500 mb-2">
              Mot de passe oublié
            </h1>
            <p className="text-neutral-400 text-sm">
              Entrez votre adresse e-mail pour recevoir un lien de réinitialisation sécurisé
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSendResetLink} className="space-y-6" noValidate>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-neutral-500 font-medium">
                  Email*
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Votre email"
                  value={formState.values.email as string}
                  onChange={handleEmailChange}
                  className={`w-full h-12 ${hasError('email')
                    ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500"
                    : "border-neutral-400 focus:border-primary-200 focus:ring-primary-200"
                    }`}
                  disabled={isLoading}
                  autoComplete="email"
                  maxLength={254}
                  required
                  aria-invalid={hasError('email')}
                  aria-describedby={hasError('email') ? "email-error" : undefined}
                />
                {hasError('email') && (
                  <div
                    id="email-error"
                    className="text-red-500 text-sm font-medium"
                    role="alert"
                    aria-live="polite"
                  >
                    {getError('email')}
                  </div>
                )}
              </div>

              {error && (
                <div
                  className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-md border border-red-200"
                  role="alert"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {error}
                </div>
              )}

              {success && successMessage && (
                <div
                  className="text-green-600 text-sm font-medium bg-green-50 p-3 rounded-md border border-green-200"
                  role="alert"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {successMessage}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || success || !isFormValid}
                className="w-full h-12 bg-primary-300 hover:bg-primary-300 text-white font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {buttonText}
              </Button>

              <p className="text-sm text-neutral-400 text-center">
                Assurez-vous de vérifier vos courriers indésirables si vous ne recevez pas notre e-mail dans quelques minutes.
              </p>

              {success && (
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="text-primary-200 hover:text-primary-300 text-sm font-medium transition-colors underline"
                  >
                    Renvoyer le lien de réinitialisation
                  </button>
                </div>
              )}
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6" noValidate>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-neutral-500 font-medium">
                  Nouveau mot de passe*
                </Label>
                <PasswordInput
                  id="password"
                  placeholder="Votre nouveau mot de passe"
                  value={formState.values.password as string}
                  onChange={handlePasswordChange}
                  className={`w-full h-12 ${hasError('password')
                    ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500"
                    : "border-neutral-400 focus:border-primary-200 focus:ring-primary-200"
                    }`}
                  disabled={isLoading}
                  autoComplete="new-password"
                  maxLength={128}
                  minLength={8}
                  required
                  aria-invalid={hasError('password')}
                  aria-describedby={hasError('password') ? "password-error" : undefined}
                />
                {hasError('password') && (
                  <div
                    id="password-error"
                    className="text-red-500 text-sm font-medium"
                    role="alert"
                    aria-live="polite"
                  >
                    {getError('password')}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="code" className="text-neutral-500 font-medium">
                  Code de réinitialisation*
                </Label>
                <InputOTP
                  value={formState.values.code as string}
                  onChange={handleCodeChange}
                  maxLength={6}
                  containerClassName="justify-center"
                >
                  <InputOTPGroup className="gap-3 w-full justify-center">
                    {Array.from({ length: 6 }, (_, index) => (
                      <InputOTPSlot
                        key={`otp-slot-${index}`}
                        index={index}
                        className="h-14 text-base w-full border rounded-md border-neutral-400 focus:border-primary-200 focus:ring-primary-200"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                {hasError('code') && (
                  <div
                    className="text-red-500 text-sm font-medium"
                    role="alert"
                    aria-live="polite"
                  >
                    {getError('code')}
                  </div>
                )}
              </div>

              {error && (
                <div
                  className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-md border border-red-200"
                  role="alert"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="w-full h-12 bg-primary-300 hover:bg-primary-300 text-white font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {buttonText}
              </Button>
            </form>
          )}

          {step === 2 && (
            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  resetState()
                  setStep(1)
                }}
                className="text-primary-200 hover:text-primary-300 text-sm font-medium transition-colors"
              >
                ← Précédent
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}