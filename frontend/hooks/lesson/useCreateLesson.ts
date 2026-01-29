import { useAuth } from '@clerk/nextjs';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useLoader } from '@/contexts/LoaderContext';
import { apiClient } from '@/lib/api-client';
import { ChapterDto, LessonStatus } from '@/types/modules/Lesson'; // ✅ Importer ChapterDto

// ✅ Ajouter chapters au type CreateLessonDto
export type CreateLessonDto = {
  title: string;
  description: string;
  duration: number;
  order: number;
  status: LessonStatus;
  chapters?: ChapterDto[]; // ✅ Ajouter ce champ
};

type BackendResponse<T = any> = {
  success: boolean;
  message?: string;
  data?: T;
};

const createLesson = async (
  moduleId: string,
  payload: CreateLessonDto,
  token: string | null
): Promise<BackendResponse> => {
  return apiClient<BackendResponse>(`modules/${moduleId}/lessons`, 'PUT', token, payload);
};

export const useCreateLesson = (options?: { onSuccess?: () => void; onError?: () => void }) => {
  const { getToken } = useAuth();
  const { showLoader, hideLoader } = useLoader();

  const mutation = useMutation({
    mutationFn: async ({ moduleId, payload }: { moduleId: string; payload: CreateLessonDto }) => {
      showLoader();
      const token = await getToken();
      return createLesson(moduleId, payload, token);
    },
    onSuccess: data => {
      hideLoader();
      if (data.success) {
        toast.success('Leçon créée avec succès !');
        options?.onSuccess?.();
      } else {
        toast.error('Création échouée', { description: data.message });
        options?.onError?.();
      }
    },
    onError: (error: Error) => {
      hideLoader();
      toast.error('Création échouée', {
        description: error.message || 'Une erreur est survenue.',
      });
      options?.onError?.();
    },
  });

  return {
    createLesson: mutation.mutate,
    isCreating: mutation.isPending,
    ...mutation,
  };
};
