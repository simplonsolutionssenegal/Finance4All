'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

export type ContactFormPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country: string;
  subject: string;
  message: string;
  website?: string;
};

type ContactResponse = {
  success: boolean;
  message: string;
  attemptsRemaining: number;
};

export const useContactEmail = () => {
  const [attemptsRemaining, setAttemptsRemaining] = useState<number>(3);

  const mutation = useMutation({
    mutationFn: async (payload: ContactFormPayload): Promise<ContactResponse> => {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => ({}))) as Partial<ContactResponse>;
      const normalized: ContactResponse = {
        success: data.success === true,
        message: data.message || "Erreur lors de l'envoi.",
        attemptsRemaining:
          typeof data.attemptsRemaining === 'number' ? data.attemptsRemaining : attemptsRemaining,
      };

      setAttemptsRemaining(normalized.attemptsRemaining);

      if (!response.ok || !normalized.success) {
        throw new Error(normalized.message);
      }

      return normalized;
    },
    onSuccess: data => {
      toast.success('Message envoye', {
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast.error("Echec de l'envoi", {
        description: error.message || 'Une erreur est survenue.',
      });
    },
  });

  return {
    sendContactEmail: mutation.mutateAsync,
    isSending: mutation.isPending,
    attemptsRemaining,
    ...mutation,
  };
};
