"use client";

import Image from "next/image";
import { useState, useCallback, useMemo } from "react";

import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { useForgotPassword } from "@/hooks/useForgotPassword";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const { isLoading, error, success, successMessage, sendResetLink, resetPassword, resetState } = useForgotPassword();
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [successfulCreation, setSuccessfulCreation] = useState(false);

  // Mémorisation des valeurs calculées pour les performances
  const isFormValid = useMemo(() => {
    if (!successfulCreation) {
      return email.trim() !== "" && !emailError;
    }
    return password.trim() !== "" && code.trim() !== "" && !passwordError && !codeError;
  }, [email, emailError, password, code, passwordError, codeError, successfulCreation]);

  const buttonText = useMemo(() => {
    if (isLoading) {
      return successfulCreation ? "Réinitialisation en cours..." : "Envoi en cours...";
    }
    if (success) {
      return successfulCreation ? "Mot de passe réinitialisé !" : "Lien envoyé !";
    }
    return successfulCreation ? "Réinitialiser le mot de passe" : "Envoyer le lien de réinitialisation";
  }, [isLoading, success, successfulCreation]);

  // Validation améliorée avec debouncing
  const validateEmail = useCallback((email: string) => {
    if (!email.trim()) {
      return "L'adresse email est requise.";
    }
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return "Veuillez entrer une adresse email valide.";
    }
    
    if (email.length > 254) {
      return "L'adresse email est trop longue.";
    }
    
    return "";
  }, []);

  const validatePassword = useCallback((password: string) => {
    if (!password.trim()) {
      return "Le mot de passe est requis.";
    }
    
    if (password.length < 8) {
      return "Le mot de passe doit contenir au moins 8 caractères.";
    }
    
    if (password.length > 128) {
      return "Le mot de passe est trop long.";
    }
    
    // Vérification de complexité
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const complexityScore = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
    
    if (complexityScore < 3) {
      return "Le mot de passe doit contenir au moins 3 des éléments suivants : majuscules, minuscules, chiffres, caractères spéciaux.";
    }
    
    return "";
  }, []);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    if (emailError && value.trim() !== "") {
      setEmailError("");
    }

    if (error && value.trim() !== "") {
      resetState();
    }

    if (success) {
      resetState();
    }
  }, [emailError, error, success, resetState]);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    if (passwordError && value.trim() !== "") {
      setPasswordError("");
    }
  }, [passwordError]);

  const handleCodeChange = useCallback((value: string) => {
    setCode(value);
    
    if (codeError && value.trim() !== "") {
      setCodeError("");
    }
  }, [codeError]);

  const handleSendResetLink = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }

    try {
      await sendResetLink(email);
      setSuccessfulCreation(true);
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
    }
  }, [email, validateEmail, sendResetLink]);

  const handleResetPassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    if (!code.trim()) {
      setCodeError("Le code est requis.");
      return;
    }

    if (code.length < 6) {
      setCodeError("Le code doit contenir au moins 6 caractères.");
      return;
    }

    await resetPassword(password, code);
  }, [password, code, validatePassword, resetPassword]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Section gauche*/}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-400 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/assets/images/login-bg.png"
            alt="Background image"
            fill
            className="object-cover opacity-50"
            priority
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

          {!successfulCreation && (
            <form onSubmit={handleSendResetLink} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-neutral-500 font-medium">
                  Email*
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Votre email"
                  value={email}
                  onChange={handleEmailChange}
                  className={`w-full h-12 ${emailError
                      ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500"
                      : "border-neutral-400 focus:border-primary-200 focus:ring-primary-200"
                    }`}
                  disabled={isLoading}
                  autoComplete="email"
                  maxLength={254}
                  required
                />
              </div>

              {/* Message d'erreur de validation */}
              {emailError && (
                <div className="text-red-500 text-sm font-medium">
                  {emailError}
                </div>
              )}

              {/* Message d'erreur API */}
              {error && (
                <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-md border border-red-200">
                  {error}
                </div>
              )}

              {/* Message de succès */}
              {success && successMessage && (
                <div className="text-green-600 text-sm font-medium bg-green-50 p-3 rounded-md border border-green-200">
                  {successMessage}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || success || !isFormValid}
                className="w-full h-12 bg-primary-300 hover:bg-primary-300 text-white font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {buttonText}
              </Button>

              <p className="text-sm text-neutral-400 text-center">
                Assurez-vous de vérifier vos courriers indésirables si vous ne recevez pas notre e-mail dans quelques minutes.
              </p>

              {/* Bouton pour renvoyer l'email en cas de succès */}
              {success && (
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      resetState();
                      setEmail("");
                    }}
                    className="text-primary-200 hover:text-primary-300 text-sm font-medium transition-colors underline"
                  >
                    Renvoyer le lien de réinitialisation
                  </button>
                </div>
              )}
            </form>
          )}

          {successfulCreation && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-neutral-500 font-medium">
                  Nouveau mot de passe*
                </Label>
                <PasswordInput
                  id="password"
                  placeholder="Votre nouveau mot de passe"
                  value={password}
                  onChange={handlePasswordChange}
                  className={`w-full h-12 ${passwordError
                    ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500"
                    : "border-neutral-400 focus:border-primary-200 focus:ring-primary-200"
                  }`}
                  disabled={isLoading}
                  autoComplete="new-password"
                  maxLength={128}
                  minLength={8}
                  required
                />
              </div>

              {passwordError && (
                <div className="text-red-500 text-sm font-medium">
                  {passwordError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="code" className="text-neutral-500 font-medium">
                  Code de réinitialisation*
                </Label>
                <InputOTP
                  value={code}
                  onChange={handleCodeChange}
                  maxLength={6}
                  containerClassName="justify-center"
                >
                  <InputOTPGroup className="gap-3 w-full justify-center">
                    <InputOTPSlot index={0} className="h-14 text-base w-full border rounded-md border-neutral-400 focus:border-primary-200 focus:ring-primary-200" />
                    <InputOTPSlot index={1} className="h-14 text-base w-full border rounded-md border-neutral-400 focus:border-primary-200 focus:ring-primary-200" />
                    <InputOTPSlot index={2} className="h-14 text-base w-full border rounded-md border-neutral-400 focus:border-primary-200 focus:ring-primary-200" />
                    <InputOTPSlot index={3} className="h-14 text-base w-full border rounded-md border-neutral-400 focus:border-primary-200 focus:ring-primary-200" />
                    <InputOTPSlot index={4} className="h-14 text-base w-full border rounded-md border-neutral-400 focus:border-primary-200 focus:ring-primary-200" />
                    <InputOTPSlot index={5} className="h-14 text-base w-full border rounded-md border-neutral-400 focus:border-primary-200 focus:ring-primary-200" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {codeError && (
                <div className="text-red-500 text-sm font-medium">
                  {codeError}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || success || !isFormValid}
                className="w-full h-12 bg-primary-300 hover:bg-primary-300 text-white font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {buttonText}
              </Button>
            </form>
          )}

          <div className="mt-8 text-center">
            <a
              href="/login"
              className="text-primary-200 hover:text-primary-300 text-sm font-medium transition-colors"
            >
              ← Retour à la connexion
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
