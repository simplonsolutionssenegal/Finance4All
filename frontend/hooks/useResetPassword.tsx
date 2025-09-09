import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import { ZodError } from 'zod';

import { buildApiUrl, API_CONFIG, DEFAULT_HEADERS, ApiResponseSchema, type ApiResponse } from '@/lib/api';

interface UseResetPasswordReturn {
    isLoading: boolean;
    error: string | null;
    success: boolean;
    successMessage: string | null;
    resetPassword: (newPassword: string) => Promise<void>;
    resetState: () => void;
}

export function useResetPassword(): UseResetPasswordReturn {
    const { user } = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const resetPassword = async (newPassword: string): Promise<void> => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);
        setSuccessMessage(null);

        try {
            if (!user?.id) {
                throw new Error('Utilisateur non authentifié. Veuillez vous connecter.');
            }

            const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.RESET_PASSWORD), {
                method: 'POST',
                headers: DEFAULT_HEADERS,
                body: JSON.stringify({ 
                    userId: user.id, 
                    newPassword 
                }),
            });

            const rawData = await response.json();
            
            // Validation des format de réponse
            const data: ApiResponse = ApiResponseSchema.parse(rawData);

            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de la réinitialisation du mot de passe');
            }

            if (data.status === 'success' && data.data.success) {
                setSuccess(true);
                setSuccessMessage(data.message || 'Mot de passe réinitialisé avec succès !');
            } else {
                throw new Error(data.message || 'Erreur lors de la réinitialisation du mot de passe');
            }
        } catch (err) {
            let errorMessage = 'Une erreur inattendue s\'est produite';
            
            if (err instanceof ZodError) {
                errorMessage = 'Format de réponse invalide du serveur';
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const resetState = () => {
        setError(null);
        setSuccess(false);
        setSuccessMessage(null);
        setIsLoading(false);
    };

    return {
        isLoading,
        error,
        success,
        successMessage,
        resetPassword,
        resetState,
    };
}
