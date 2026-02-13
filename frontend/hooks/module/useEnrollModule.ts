'use client';

import { useAuth } from '@clerk/nextjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { apiClient } from '@/lib/api-client';

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
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ moduleId }: { moduleId: string }) => {
      const token = await getToken();
      return apiClient<EnrollModuleResponse>(`modules/${moduleId}/enroll`, 'POST', token);
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
