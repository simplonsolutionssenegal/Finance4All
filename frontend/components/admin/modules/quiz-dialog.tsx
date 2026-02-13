'use client';

import { useCreateQuiz } from '@/hooks/quiz/useCreateQuiz';
import { useUpdateQuiz } from '@/hooks/quiz/useUpdateQuiz';
import type { Quiz } from '@/types/modules/Quiz';

import QuizFormDialog, { type QuizDraft } from './quiz-form-dialog';

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  moduleId: string;
  editingQuiz?: Quiz | null;
  onDone?: () => void;
  onCreated?: () => void;
};

export default function QuizDialog({
  open,
  onOpenChange,
  moduleId,
  editingQuiz = null,
  onDone,
  onCreated,
}: Props) {
  const { createQuiz, isCreating } = useCreateQuiz({
    onSuccess: () => {
      onOpenChange(false);
      onDone?.();
      onCreated?.();
    },
  });

  const { updateQuiz, isUpdating } = useUpdateQuiz({
    onSuccess: () => {
      onOpenChange(false);
      onDone?.();
      onCreated?.();
    },
  });

  const isSubmitting = isCreating || isUpdating;

  const initial: Partial<QuizDraft> | undefined = editingQuiz
    ? {
        title: editingQuiz.title,
        description: editingQuiz.description,
        status: editingQuiz.status,
        scoreMinimum: editingQuiz.scoreMinimum,
        duree: editingQuiz.duree ?? undefined,
        nombreTentatives: editingQuiz.nombreTentatives,
        questions: editingQuiz.questions ?? [],
      }
    : undefined;

  const handleSubmit = (quiz: QuizDraft) => {
    if (editingQuiz?.id) {
      updateQuiz({
        quizId: editingQuiz.id,
        payload: quiz,
      });
      return;
    }

    createQuiz({
      moduleId,
      payload: quiz,
    });
  };

  return (
    <QuizFormDialog
      open={open}
      onOpenChange={v => !isSubmitting && onOpenChange(v)}
      subtitle='Quiz de module'
      initial={initial}
      submitLabel={
        editingQuiz
          ? isSubmitting
            ? 'Modification…'
            : 'Modifier le quiz'
          : isSubmitting
            ? 'Création…'
            : 'Créer le quiz'
      }
      onSubmit={handleSubmit}
    />
  );
}
