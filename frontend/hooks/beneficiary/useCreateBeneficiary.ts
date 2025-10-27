import { useAuth } from '@clerk/nextjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { apiClient } from '@/lib/api-client';

interface CreateBeneficiaryRequest {
  clerkUserId: string;
  name: string;
  email: string;
  phoneNumber: string;
}

interface CreateBeneficiaryResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    role: string;
  };
  message: string;
}

const createBeneficiary = async (
  data: CreateBeneficiaryRequest,
  token: string | null
): Promise<CreateBeneficiaryResponse> => {
  return apiClient<CreateBeneficiaryResponse>('api/v1/beneficiaries', 'POST', token, data);
};

export const useCreateBeneficiary = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBeneficiaryRequest) => {
      const token = await getToken();
      return createBeneficiary(data, token);
    },
    onSuccess: response => {
      toast.success('Bénéficiaire créé avec succès', {
        description: response.message,
      });

      // Invalider les caches pertinents si nécessaire
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
    },
    onError: (error: Error) => {
      console.error('Erreur lors de la création du bénéficiaire:', error);
      toast.error('Échec de la création du bénéficiaire', {
        description: error.message,
      });
    },
  });
};
