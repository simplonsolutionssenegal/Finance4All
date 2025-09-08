import { useClerk } from '@clerk/nextjs';
import { useState } from 'react';
import { ZodError } from 'zod';

import { buildApiUrl, API_CONFIG, DEFAULT_HEADERS, ApiResponseSchema, type ApiResponse } from '@/lib/api';

interface UseForgotPasswordReturn {
    isLoading: boolean;
    error: string | null;
    success: boolean;
    successMessage: string | null;
    sendResetLink: (email: string) => Promise<void>;
    resetState: () => void;
}

export function useForgotPassword(): UseForgotPasswordReturn {
    const { client } = useClerk();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const sendResetLink = async (email: string): Promise<void> => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);
        setSuccessMessage(null);

        try {
            const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.FORGOT_PASSWORD), {
                method: 'POST',
                headers: DEFAULT_HEADERS,
                body: JSON.stringify({ email }),
            });

            const rawData = await response.json();
            
            // Validation avec Zod
            const data: ApiResponse = ApiResponseSchema.parse(rawData);

            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de l\'envoi du lien de réinitialisation');
            }

            if (data.status === 'success' && data.data.success) {
                const result = await client.signIn.create({
                    strategy: 'email_link',
                    identifier: email,
                    redirectUrl: `${window.location.origin}/reset-password`,
                });

                if (result) {
                    setSuccess(true);
                    setSuccessMessage(data.message || 'Lien de réinitialisation envoyé avec succès !');
                }
            } else {
                throw new Error(data.message || 'Erreur lors de l\'envoi du lien de réinitialisation');
            }
        } catch (err) {
            let errorMessage = 'Une erreur inattendue s\'est produite';
            
            if (err instanceof Error) {
                errorMessage = err.message;
            } else if (err instanceof ZodError) {
                errorMessage = 'Format de réponse invalide du serveur';
                console.error('Erreur de validation Zod:', err.errors);
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
        sendResetLink,
        resetState,
    };
}
