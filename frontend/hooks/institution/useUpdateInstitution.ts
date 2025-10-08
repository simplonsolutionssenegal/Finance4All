import { useAuth } from '@clerk/nextjs';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useLoader } from '@/contexts/LoaderContext';
import type { UpdateInstitutionDto } from '@/types/Institution';

interface BackendResponse {
  success: boolean;
  message?: string;
  data?: any;
}

interface BackendErrorResponse {
  message?: string;
  errors?: { message: string }[];
}

const updateInstitution = async (
  id: string,
  institutionData: UpdateInstitutionDto,
  token: string | null
): Promise<BackendResponse> => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/institutions/${id}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(apiUrl, {
    method: 'PUT',
    headers,
    body: JSON.stringify(institutionData),
  });

  if (!response.ok) {
    let errorData: BackendErrorResponse;
    try {
      errorData = await response.json();
    } catch (_parseError) {
      errorData = { message: `Error HTTP ${response.status}: ${response.statusText}` };
    }
    throw new Error(
      errorData.errors?.[0]?.message || errorData.message || 'Failed to update institution'
    );
  }

  return response.json();
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
