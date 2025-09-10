"use client";

import Image from "next/image";
import { useState, useCallback, useMemo, useEffect } from "react";

import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { useForgotPassword } from "@/hooks/useForgotPassword";

const validateEmail = (email: string): string => {
  if (!email.trim()) return "L'adresse email est requise.";

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) return "Veuillez entrer une adresse email valide.";

  if (email.length > 254) return "L'adresse email est trop longue.";

  return "";
};

const validatePassword = (password: string): string => {
  if (!password.trim()) return "Le mot de passe est requis.";

  if (password.length < 8) return "Le mot de passe doit contenir au moins 8 caractères.";

  if (password.length > 128) return "Le mot de passe est trop long.";

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const complexityScore = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;

  if (complexityScore < 3) {
    return "Le mot de passe doit contenir au moins 3 des éléments suivants : majuscules, minuscules, chiffres, caractères spéciaux.";
  }

  return "";
};

interface FormState {
  email: string;
  password: string;
  code: string;
  emailError: string;
  passwordError: string;
  codeError: string;
}

export default function ForgotPassword() {
  const [step, setStep] = useState(1);

  const [formState, setFormState] = useState<FormState>({
    email: "",
    password: "",
    code: "",
    emailError: "",
    passwordError: "",
    codeError: ""
  });

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
      return formState.email.trim() !== "" && !formState.emailError;
    }
    return formState.password.trim() !== "" &&
      formState.code.trim() !== "" &&
      !formState.passwordError &&
      !formState.codeError;
  }, [formState, step]);

  const buttonText = useMemo(() => {
    if (isLoading) {
      return step === 1 ? "Envoi en cours..." : "Réinitialisation en cours...";
    }
    if (success) {
      return step === 1 ? "Lien envoyé !" : "Mot de passe réinitialisé !";
    }
    return step === 1 ? "Envoyer le lien de réinitialisation" : "Réinitialiser le mot de passe";
  }, [isLoading, success, step]);

  const handleInputChange = useCallback((field: keyof FormState, value: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: value,
      [`${field}Error`]: ""
    }));

    if (error) {
      resetState();
    }
  }, [error, resetState]);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('email', e.target.value);
  }, [handleInputChange]);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('password', e.target.value);
  }, [handleInputChange]);

  const handleCodeChange = useCallback((value: string) => {
    handleInputChange('code', value);
  }, [handleInputChange]);

  const handleSendResetLink = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const emailValidationError = validateEmail(formState.email);
    if (emailValidationError) {
      setFormState(prev => ({ ...prev, emailError: emailValidationError }));
      return;
    }

    try {
      await sendResetLink(formState.email);
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
    }
  }, [formState.email, sendResetLink]);

  const handleResetPassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordValidationError = validatePassword(formState.password);
    if (passwordValidationError) {
      setFormState(prev => ({ ...prev, passwordError: passwordValidationError }));
      return;
    }

    if (!formState.code.trim()) {
      setFormState(prev => ({ ...prev, codeError: "Le code est requis." }));
      return;
    }

    if (formState.code.length < 6) {
      setFormState(prev => ({ ...prev, codeError: "Le code doit contenir au moins 6 caractères." }));
      return;
    }

    await resetPassword(formState.password, formState.code);
  }, [formState.password, formState.code, resetPassword]);

  const handleResetForm = useCallback(() => {
    setFormState({
      email: "",
      password: "",
      code: "",
      emailError: "",
      passwordError: "",
      codeError: ""
    });
    resetState();
    setStep(1);
  }, [resetState]);

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
                  value={formState.email}
                  onChange={handleEmailChange}
                  className={`w-full h-12 ${formState.emailError
                    ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500"
                    : "border-neutral-400 focus:border-primary-200 focus:ring-primary-200"
                    }`}
                  disabled={isLoading}
                  autoComplete="email"
                  maxLength={254}
                  required
                  aria-invalid={!!formState.emailError}
                  aria-describedby={formState.emailError ? "email-error" : undefined}
                />
                {formState.emailError && (
                  <div
                    id="email-error"
                    className="text-red-500 text-sm font-medium"
                    role="alert"
                    aria-live="polite"
                  >
                    {formState.emailError}
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
                  value={formState.password}
                  onChange={handlePasswordChange}
                  className={`w-full h-12 ${formState.passwordError
                    ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500"
                    : "border-neutral-400 focus:border-primary-200 focus:ring-primary-200"
                    }`}
                  disabled={isLoading}
                  autoComplete="new-password"
                  maxLength={128}
                  minLength={8}
                  required
                  aria-invalid={!!formState.passwordError}
                  aria-describedby={formState.passwordError ? "password-error" : undefined}
                />
                {formState.passwordError && (
                  <div
                    id="password-error"
                    className="text-red-500 text-sm font-medium"
                    role="alert"
                    aria-live="polite"
                  >
                    {formState.passwordError}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="code" className="text-neutral-500 font-medium">
                  Code de réinitialisation*
                </Label>
                <InputOTP
                  value={formState.code}
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
                {formState.codeError && (
                  <div
                    className="text-red-500 text-sm font-medium"
                    role="alert"
                    aria-live="polite"
                  >
                    {formState.codeError}
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