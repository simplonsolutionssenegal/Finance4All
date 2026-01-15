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

const updateServiceRequest = async (
  institutionId: string,
  serviceId: string,
  serviceData: Partial<CreateServiceDto>, // PATCH => partiel OK (ou mets CreateServiceDto si tu envoies tout)
  token: string | null
): Promise<BackendResponse> => {
  return apiClient<BackendResponse>(
    `institutions/${institutionId}/services/${serviceId}`,
    'PUT',
    token,
    serviceData
  );
};

export const useUpdateService = (options?: { onSuccess?: () => void }) => {
  const { getToken } = useAuth();
  const { showLoader, hideLoader } = useLoader();

  const mutation = useMutation({
    mutationFn: async ({
      institutionId,
      serviceId,
      serviceData,
    }: {
      institutionId: string;
      serviceId: string;
      serviceData: Partial<CreateServiceDto>;
    }) => {
      showLoader();
      const token = await getToken();
      return updateServiceRequest(institutionId, serviceId, serviceData, token);
    },
    onSuccess: data => {
      hideLoader();
      if (data.success === true) {
        toast.success('Service modifié avec succès !');
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
    updateService: mutation.mutate,
    isUpdating: mutation.isPending,
    ...mutation,
  };
};
