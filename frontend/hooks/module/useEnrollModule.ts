'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface EnrollModuleResponse {
  success?: boolean;
  status?: 'success' | 'error';
  message?: string;
  data?: {
    id: string;
    moduleId: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
  };
}

export const useEnrollModule = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ moduleId }: { moduleId: string }) => {
      const response = await fetch(`/api/modules/${moduleId}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
      });

      const data = (await response.json().catch(() => ({}))) as EnrollModuleResponse;

      if (!response.ok) {
        throw new Error(data.message || `Erreur ${response.status}: ${response.statusText}`);
      }

      return data;
    },
    onSuccess: data => {
      const ok = data?.success === true || data?.status === 'success' || data == null;
      if (!ok) {
        toast.error('Inscription echouee', {
          description: data?.message ?? 'Une erreur est survenue.',
        });
        return;
      }

      queryClient.invalidateQueries({ queryKey: ['module-enrollments'] });
    },
    onError: (error: Error) => {
      toast.error('Inscription echouee', {
        description: error.message || 'Une erreur est survenue.',
      });
    },
  });

  return {
    enrollModule: mutation.mutate,
    enrollModuleAsync: mutation.mutateAsync,
    isEnrolling: mutation.isPending,
    ...mutation,
  };
};
