import { useAuth } from '@clerk/nextjs';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useLoader } from '@/contexts/LoaderContext';
import { apiClient } from '@/lib/api-client';

interface BackendResponse {
  success: boolean;
  message?: string;
  data?: any;
}

const patchInstitutionStatus = async (
  id: string,
  action: 'activate' | 'desactivate',
  token: string | null
): Promise<BackendResponse> => {
  return apiClient<BackendResponse>(`institutions/${id}/${action}`, 'PATCH', token);
};

export const useUpdateInstitutionStatus = (options?: { onSuccess?: () => void }) => {
  const { getToken } = useAuth();
  const { showLoader, hideLoader } = useLoader();

  const handleSuccess = (data: BackendResponse, successMsg: string) => {
    hideLoader();
    if (data.success) {
      toast.success(successMsg);
      options?.onSuccess?.();
    } else {
      toast.error('La modification a échoué', { description: data.message });
    }
  };

  const handleError = (error: Error) => {
    hideLoader();
    toast.error('La modification a échoué', {
      description: error.message || 'An unexpected error occurred.',
    });
  };

  const activateMutation = useMutation({
    mutationFn: async (id: string) => {
      showLoader();
      const token = await getToken();
      return patchInstitutionStatus(id, 'activate', token);
    },
    onSuccess: data => handleSuccess(data, 'Institution activée avec succès!'),
    onError: handleError,
  });

  const deactivateMutation = useMutation({
    mutationFn: async (id: string) => {
      showLoader();
      const token = await getToken();
      return patchInstitutionStatus(id, 'desactivate', token);
    },
    onSuccess: data => handleSuccess(data, 'Institution désactivée avec succès!'),
    onError: handleError,
  });

  return {
    activateInstitution: activateMutation.mutate,
    isActivating: activateMutation.isPending,

    deactivateInstitution: deactivateMutation.mutate,
    isDeactivating: deactivateMutation.isPending,
  };
};
