"use client";

import { useClerk } from "@clerk/nextjs";
import { useState } from "react";

import { apiClient } from "@/lib/api";

interface UseForgotPasswordReturn {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  successMessage: string | null;
  sendResetLink: (email: string) => Promise<void>;
  resetState: () => void;
}

export const useForgotPassword = (): UseForgotPasswordReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const { client, session } = useClerk();

  const resetState = () => {
    setError(null);
    setSuccess(false);
    setSuccessMessage(null);
    setIsLoading(false);
  };

  const sendResetLink = async (email: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setSuccessMessage(null);

    try {
      // Vérifier si l'utilisateur est déjà connecté
      if (session) {
        setError("Vous êtes déjà connecté. Veuillez utiliser la page de changement de mot de passe dans votre profil.");
        setIsLoading(false);
        return;
      }

      // Créer le lien de réinitialisation avec Clerk
      await client.signIn.create({
        strategy: "email_link",
        identifier: email,
        redirectUrl: `${window.location.origin}/reset-password`,
      });

      // Appeler l'API backend pour enregistrer la demande
      const response = await apiClient.forgotPassword(email);

      if (response.status === "error") {
        throw new Error(response.message);
      }

      if (response.status === "success") {
        setSuccess(true);
        setSuccessMessage(response.message || "Lien de réinitialisation envoyé avec succès");
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
    sendResetLink,
    resetState,
  };
};
