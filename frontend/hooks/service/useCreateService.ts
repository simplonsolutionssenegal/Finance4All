import { useAuth } from '@clerk/nextjs';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useLoader } from '@/contexts/LoaderContext';
import { apiClient } from '@/lib/api-client';
import type { CreateServiceDto } from '@/types/Service';

interface BackendResponse {
  success: boolean;
  message?: string;
  data?: any;
}

const createService = async (
  institutionId: string,
  serviceData: CreateServiceDto,
  token: string | null
): Promise<BackendResponse> => {
  return apiClient<BackendResponse>(
    `institutions/${institutionId}/services`,
    'PUT',
    token,
    serviceData
  );
};

export const useCreateService = (options?: { onSuccess?: () => void }) => {
  const { getToken } = useAuth();
  const { showLoader, hideLoader } = useLoader();

  const mutation = useMutation({
    mutationFn: async ({
      institutionId,
      serviceData,
    }: {
      institutionId: string;
      serviceData: CreateServiceDto;
    }) => {
      showLoader();
      const token = await getToken();
      return createService(institutionId, serviceData, token);
    },
    onSuccess: data => {
      hideLoader();
      if (data.success === true) {
        toast.success('Service créé avec succès!');
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
    createService: mutation.mutate,
    isCreating: mutation.isPending,
    ...mutation,
  };
};
