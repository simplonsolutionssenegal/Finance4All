// frontend/src/hooks/modules/useCreateModule.ts

import { useAuth } from '@clerk/nextjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useLoader } from '@/contexts/LoaderContext';
import { apiClient } from '@/lib/api-client';
import type { CreateModuleData, Module } from '@/types/modules/module';

interface ModuleResponse {
  success: boolean;
  message?: string;
  data?: Module;
}

export const useCreateModule = (options?: { onSuccess?: () => void }) => {
  const { getToken } = useAuth();
  const { showLoader, hideLoader } = useLoader();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (moduleData: CreateModuleData) => {
      showLoader();
      const token = await getToken();
      return apiClient<ModuleResponse>('modules', 'POST', token, moduleData);
    },
    onSuccess: data => {
      hideLoader();
      if (data.success === true) {
        toast.success('Module créé avec succès!');
        queryClient.invalidateQueries({ queryKey: ['modules'] });
        options?.onSuccess?.();
      } else {
        toast.error('La création du module a échoué', {
          description: data.message,
        });
      }
    },
    onError: (error: Error) => {
      hideLoader();
      toast.error('La création du module a échoué', {
        description: error.message || 'Une erreur inattendue est survenue.',
      });
    },
  });

  return {
    createModule: mutation.mutate,
    isCreating: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
};
