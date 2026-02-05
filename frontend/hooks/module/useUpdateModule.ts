// frontend/src/hooks/module/useUpdateModule.ts
import { useAuth } from '@clerk/nextjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useLoader } from '@/contexts/LoaderContext';
import { apiClient } from '@/lib/api-client';
import type { Module, UpdateModuleData } from '@/types/modules/module';

type UpdateModuleParams = { id: string; data: UpdateModuleData };

interface ModuleResponse {
  success: boolean;
  message?: string;
  data?: Module;
}

export const useUpdateModule = (options?: { onSuccess?: () => void }) => {
  const { getToken } = useAuth();
  const { showLoader, hideLoader } = useLoader();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ id, data }: UpdateModuleParams) => {
      showLoader();
      const token = await getToken();
      return apiClient<ModuleResponse>(`modules/${id}`, 'PUT', token, data);
    },
    onSuccess: res => {
      hideLoader();
      if (res?.success) {
        toast.success('Module modifié avec succès');
        queryClient.invalidateQueries({ queryKey: ['modules'] });
        queryClient.invalidateQueries({ queryKey: ['module', 'byId'] });
        options?.onSuccess?.();
      } else {
        toast.error('Modification échouée', { description: res?.message ?? 'Erreur' });
      }
    },
    onError: (err: Error) => {
      hideLoader();
      toast.error('Modification échouée', { description: err.message });
    },
  });

  return {
    updateModule: mutation.mutate,
    updateModuleAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
};
