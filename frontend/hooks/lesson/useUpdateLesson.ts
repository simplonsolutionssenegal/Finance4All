'use client';

import { useAuth } from '@clerk/nextjs';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useLoader } from '@/contexts/LoaderContext';
import { apiClient } from '@/lib/api-client';
import type { LessonStatus, ChapterDto } from '@/types/modules/Lesson';
import type { QuizDraft } from '@/components/admin/modules/quiz-form-dialog';

export type UpdateLessonPayload = {
  title: string;
  description: string;
  status: LessonStatus;
  duration: number;
  order?: number;

  chapters: Array<{
    title: string;
    description: string;
    order: number;
    mediaId?: string;
    quizzes?: QuizDraft[];
  }>;

  quizzes?: QuizDraft[];
};

type BackendResponse<T = any> = {
  success?: boolean;
  message?: string;
  data?: T;
};

const updateLessonApi = async (
  lessonId: string,
  payload: UpdateLessonPayload,
  token: string | null
): Promise<BackendResponse> => {
  // adapte PUT/PATCH selon ton backend
  return apiClient<BackendResponse>(`lessons/${lessonId}`, 'PUT', token, payload);
};

export const useUpdateLesson = (options?: { onSuccess?: () => void }) => {
  const { getToken } = useAuth();
  const { showLoader, hideLoader } = useLoader();

  const mutation = useMutation({
    mutationFn: async ({
      lessonId,
      payload,
    }: {
      lessonId: string;
      payload: UpdateLessonPayload;
    }) => {
      showLoader();
      const token = await getToken();
      return updateLessonApi(lessonId, payload, token);
    },
    onSuccess: res => {
      hideLoader();

      // robuste: si le backend ne renvoie pas "success", on considere OK si pas de success=false
      if (res?.success === false) {
        toast.error('La modification a echoue', { description: res?.message });
        return;
      }

      toast.success('Lecon modifiee avec succes !');
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      hideLoader();
      toast.error('La modification a echoue', {
        description: error.message || 'An unexpected error occurred.',
      });
    },
  });

  return {
    updateLesson: mutation.mutate,
    isUpdating: mutation.isPending,
    ...mutation,
  };
};
