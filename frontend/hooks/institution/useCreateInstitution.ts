import { useAuth } from '@clerk/nextjs';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useLoader } from '@/contexts/LoaderContext';
import { apiClient } from '@/lib/api-client';
import type { CreateInstitutionDto } from '@/types/Institution';

interface BackendResponse {
  success: boolean;
  message?: string;
  data?: any;
}

const createInstitution = async (
  institutionData: CreateInstitutionDto,
  token: string | null
): Promise<BackendResponse> => {
  return apiClient<BackendResponse>('institutions', 'POST', token, institutionData);
};

export const useCreateInstitution = (options?: { onSuccess?: () => void }) => {
  const { getToken } = useAuth();
  const { showLoader, hideLoader } = useLoader();

  const mutation = useMutation({
    mutationFn: async (institutionData: CreateInstitutionDto) => {
      showLoader();
      const token = await getToken();
      return createInstitution(institutionData, token);
    },
    onSuccess: data => {
      hideLoader();
      if (data.success === true) {
        toast.success('Institution créée avec succès!');
        options?.onSuccess?.();
      } else {
        toast.error('La création a échoué', {
          description: data.message,
        });
      }
    },
    onError: (error: Error) => {
      hideLoader();
      toast.error('La création a échoué', {
        description: error.message || 'An unexpected error occurred.',
      });
    },
  });

  return {
    createInstitution: mutation.mutate,
    isCreating: mutation.isPending,
    ...mutation,
  };
};
