"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";

interface UseResetPasswordReturn {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  successMessage: string | null;
  resetPassword: (newPassword: string) => Promise<void>;
  resetState: () => void;
}

export const useResetPassword = (): UseResetPasswordReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const { user } = useUser();

  const resetState = () => {
    setError(null);
    setSuccess(false);
    setSuccessMessage(null);
    setIsLoading(false);
  };

  const resetPassword = async (newPassword: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setSuccessMessage(null);

    try {
      // Vérifier si l'utilisateur est authentifié
      if (!user) {
        setError("Utilisateur non authentifié. Veuillez vous connecter.");
        setIsLoading(false);
        return;
      }

      // Appeler l'API backend pour réinitialiser le mot de passe
      const response = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de la réinitialisation");
      }

      if (data.status === "success") {
        setSuccess(true);
        setSuccessMessage(data.message || "Mot de passe réinitialisé avec succès");
      } else {
        throw new Error(data.message || "Format de réponse invalide du serveur");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    success,
    successMessage,
    resetPassword,
    resetState,
  };
};
