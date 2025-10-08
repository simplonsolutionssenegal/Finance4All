import { useAuth } from '@clerk/nextjs';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useLoader } from '@/contexts/LoaderContext';
import { apiClient } from '@/lib/api-client';
import type { UpdateInstitutionDto } from '@/types/Institution';

interface BackendResponse {
  success: boolean;
  message?: string;
  data?: any;
}

const updateInstitution = async (
  id: string,
  institutionData: UpdateInstitutionDto,
  token: string | null
): Promise<BackendResponse> => {
  return apiClient<BackendResponse>(`institutions/${id}`, 'PUT', token, institutionData);
};

export const useUpdateInstitution = (options?: { onSuccess?: () => void }) => {
  const { getToken } = useAuth();
  const { showLoader, hideLoader } = useLoader();

  const mutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateInstitutionDto }) => {
      showLoader();
      const token = await getToken();
      return updateInstitution(id, data, token);
    },
    onSuccess: data => {
      hideLoader();
      if (data.success === true) {
        toast.success('Institution modifiée avec succès!');
        options?.onSuccess?.();
      } else {
        toast.error('La modification a échoué', {
          description: data.message,
        });
      }
    },
    onError: (error: Error) => {
      hideLoader();
      toast.error('La modification a échoué', {
        description: error.message || 'An unexpected error occurred.',
      });
    },
  });

  return {
    updateInstitution: mutation.mutate,
    isUpdating: mutation.isPending,
    ...mutation,
  };
};
