"use client";

import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResetPassword } from "@/hooks/useResetPassword";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { isLoading, error, success, successMessage, resetPassword, resetState } = useResetPassword();

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPassword(value);
    
    if (passwordError && value.trim() !== "") {
      setPasswordError("");
    }

    if(error && value.trim() !== "") {
      resetState();
    }
    
    if (success) {
      resetState();
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    
    if (confirmPasswordError && value.trim() !== "") {
      setConfirmPasswordError("");
    }

    if(error && value.trim() !== "") {
      resetState();
    }
    
    if (success) {
      resetState();
    }
  };

  const validatePasswords = () => {
    let isValid = true;

    // Validation du nouveau mot de passe
    if (!newPassword.trim()) {
      setPasswordError("Le nouveau mot de passe est requis.");
      isValid = false;
    } else if (newPassword.length < 8) {
      setPasswordError("Le mot de passe doit contenir au moins 8 caractères.");
      isValid = false;
    } else {
      setPasswordError("");
    }

    // Validation de la confirmation
    if (!confirmPassword.trim()) {
      setConfirmPasswordError("La confirmation du mot de passe est requise.");
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Les mots de passe ne correspondent pas.");
      isValid = false;
    } else {
      setConfirmPasswordError("");
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswords()) {
      return;
    }

    try {
      await resetPassword(newPassword);
    } catch (error) {
      console.error("Erreur lors de la réinitialisation:", error);
    }
  };

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
            Créez votre nouveau mot de passe
          </h1>
          <p className="text-lg text-white/90 leading-relaxed">
            Choisissez un mot de passe sécurisé pour protéger votre compte. Assurez-vous qu&apos;il contient au moins 8 caractères et qu&apos;il est différent de vos mots de passe précédents.
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
              Nouveau mot de passe
            </h1>
            <p className="text-neutral-400 text-sm">
              Entrez votre nouveau mot de passe sécurisé
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-neutral-500 font-medium">
                Nouveau mot de passe*
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Votre nouveau mot de passe"
                  value={newPassword}
                  onChange={handleNewPasswordChange}
                  className={`w-full h-12 pr-12 ${
                    passwordError 
                      ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500" 
                      : "border-neutral-400 focus:border-primary-200 focus:ring-primary-200"
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  disabled={isLoading}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {passwordError && (
              <div className="text-red-500 text-sm font-medium">
                {passwordError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-neutral-500 font-medium">
                Confirmer le mot de passe*
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirmez votre nouveau mot de passe"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  className={`w-full h-12 pr-12 ${
                    confirmPasswordError 
                      ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500" 
                      : "border-neutral-400 focus:border-primary-200 focus:ring-primary-200"
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {confirmPasswordError && (
              <div className="text-red-500 text-sm font-medium">
                {confirmPasswordError}
              </div>
            )}

            {error && (
              <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-md border border-red-200">
                {error}
              </div>
            )}

            {success && successMessage && (
              <div className="text-green-600 text-sm font-medium bg-green-50 p-3 rounded-md border border-green-200">
                {successMessage}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || success}
              className="w-full h-12 bg-primary-300 hover:bg-primary-300 text-white font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Réinitialisation en cours..." : success ? "Mot de passe modifié !" : "Réinitialiser le mot de passe"}
            </Button>

            <p className="text-sm text-neutral-400 text-center">
              Votre mot de passe doit contenir au moins 8 caractères pour être sécurisé.
            </p>
          </form>

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
