'use client';

import QuizFormDialog, { type QuizDraft } from './quiz-form-dialog';

import { useCreateQuiz } from '@/hooks/quiz/useCreateQuiz';

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  moduleId: string;
  onCreated?: () => void;
};

export default function QuizDialog({ open, onOpenChange, moduleId, onCreated }: Props) {
  const { createQuiz, isCreating } = useCreateQuiz({
    onSuccess: () => {
      onOpenChange(false);
      onCreated?.();
    },
  });

  const handleSubmit = (quiz: QuizDraft) => {
    createQuiz({
      moduleId,
      payload: quiz,
    });
  };

  return (
    <QuizFormDialog
      open={open}
      onOpenChange={v => !isCreating && onOpenChange(v)}
      subtitle='Quiz de module'
      submitLabel={isCreating ? 'Création…' : 'Créer le quiz'}
      onSubmit={handleSubmit}
    />
  );
}
