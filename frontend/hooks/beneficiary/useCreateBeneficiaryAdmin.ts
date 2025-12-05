'use client';

import { useAuth } from '@clerk/nextjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreateBeneficiaryPayload } from '@/components/beneficiaire/AddBeneficiaryModal';
import { apiClient } from '@/lib/api-client';

type CreateBeneficiaryResponse = {
  success: boolean;
  message?: string;
  data?: unknown;
  tempPassword?: string;
};

export function useCreateBeneficiaryAdmin() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateBeneficiaryPayload) => {
      const token = await getToken();
      if (!token) throw new Error('Unauthenticated');

      const res = await apiClient<CreateBeneficiaryResponse>(
        'beneficiaries',
        'POST',
        token,
        payload
      );

      if (!res?.success)
        throw new Error(res?.message || 'Erreur lors de la création du bénéficiaire');
      return res;
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
      await queryClient.refetchQueries({ queryKey: ['beneficiaries'] });
    },
  });
}
