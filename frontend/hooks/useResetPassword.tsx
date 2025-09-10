"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";

import { apiClient } from "@/lib/api";

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
      const response = await apiClient.resetPassword(user.id, newPassword);

      if (response.status === "error") {
        throw new Error(response.message);
      }

      if (response.status === "success") {
        setSuccess(true);
        setSuccessMessage(response.message || "Mot de passe réinitialisé avec succès");
      } else {
        throw new Error("Format de réponse invalide du serveur");
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
