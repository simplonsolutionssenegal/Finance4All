'use client';

import { ChevronLeft, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGetQuizProgress } from '@/hooks/quiz/useGetQuizProgress';
import { useSubmitQuizAttempt } from '@/hooks/quiz/useSubmitQuizAttempt';
import { type QuestionDTO, TypeQuestion } from '@/types/learning/lesson';
import type { QuizAttemptResult, SubmittedAnswer } from '@/types/learning/quiz-progress';

interface QuizRunnerProps {
  readonly moduleId: string;
  readonly quiz: {
    id: string;
    title: string;
    description: string;
    scoreMinimum: number;
    questions: QuestionDTO[];
  };
  readonly afterSuccessRedirect: string;
}

type SelectionState = Record<number, number[]>;

const normalizeIndexes = (indexes: number[]) => [...new Set(indexes)].sort((a, b) => a - b);

const arraysEqual = (a: number[], b: number[]) =>
  a.length === b.length && a.every((value, idx) => value === b[idx]);

export default function QuizRunner({ moduleId, quiz, afterSuccessRedirect }: QuizRunnerProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selections, setSelections] = useState<SelectionState>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [attemptResult, setAttemptResult] = useState<QuizAttemptResult | null>(null);

  const { progress } = useGetQuizProgress(quiz.id);
  const { submitAttempt, isSubmitting } = useSubmitQuizAttempt(quiz.id);

  const questions = quiz.questions;
  const total = questions.length;
  const current = questions[currentIndex];
  const progressPercent = total > 0 ? ((currentIndex + 1) / total) * 100 : 0;

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === total - 1;

  const currentSelection = selections[currentIndex] ?? [];
  const hasSelection = currentSelection.length > 0;
  const noAttemptsLeft = progress?.remainingAttempts === 0 && !progress?.hasPassed;

  const resultAnswers = attemptResult?.answers ?? null;
  const passedQuiz = attemptResult?.hasPassedQuiz ?? attemptResult?.isPassed ?? false;

  const answersPayload: SubmittedAnswer[] = useMemo(
    () =>
      questions.map((_, idx) => ({
        questionIndex: idx,
        selectedOptionIndexes: selections[idx] ?? [],
      })),
    [questions, selections]
  );

  function toggleOption(optionIndex: number) {
    if (!current) return;

    if (current.type === TypeQuestion.CHOIX_UNIQUE) {
      setSelections(prev => ({ ...prev, [currentIndex]: [optionIndex] }));
      return;
    }

    setSelections(prev => {
      const arr = prev[currentIndex] ?? [];
      const next = arr.includes(optionIndex)
        ? arr.filter(idx => idx !== optionIndex)
        : [...arr, optionIndex];
      return { ...prev, [currentIndex]: next };
    });
  }

  function handlePrev() {
    if (!isFirst) setCurrentIndex(i => i - 1);
  }

  async function handleNext() {
    if (!hasSelection || !current) return;

    if (isLast) {
      if (noAttemptsLeft) return;
      setSubmitError(null);
      try {
        const response = await submitAttempt(answersPayload);
        if (!response.success) {
          throw new Error(response.message ?? 'Échec de la soumission du quiz');
        }
        setAttemptResult(response.data);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Une erreur est survenue lors de la soumission.';
        setSubmitError(message);
      }
      return;
    }
    setCurrentIndex(i => i + 1);
  }

  function handleRetry() {
    setAttemptResult(null);
    setSubmitError(null);
    setSelections({});
    setCurrentIndex(0);
  }

  if (!current) {
    return (
      <p className='text-sm text-grey-600'>
        Aucune question dans ce quiz.
        <Link href={`/learning/${moduleId}`} className='ml-2 text-primary-600 underline'>
          Retour au module
        </Link>
      </p>
    );
  }

  if (attemptResult) {
    const scorePercent = attemptResult.scorePercent;
    const scoreLabel = `${attemptResult.earnedPoints}/${attemptResult.totalPoints} points`;
    const remaining = attemptResult.remainingAttempts;

    return (
      <div className='space-y-6'>
        <div className='rounded-2xl border border-grey-200 bg-white p-5 shadow-sm'>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <h2 className='text-lg font-semibold text-secondary-400'>{quiz.title}</h2>
              <p className='mt-1 text-sm text-grey-600'>{quiz.description}</p>
            </div>
            <div
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                passedQuiz ? 'bg-success-100 text-success-700' : 'bg-warning-100 text-warning-700'
              }`}
            >
              {passedQuiz ? (
                <CheckCircle2 className='h-4 w-4 text-success-600' />
              ) : (
                <XCircle className='h-4 w-4 text-warning-600' />
              )}
              {passedQuiz ? 'Quiz réussi' : 'Quiz non réussi'}
            </div>
          </div>

          <div className='mt-4 grid gap-3 text-sm text-grey-600 sm:grid-cols-3'>
            <div className='rounded-xl bg-grey-50 px-3 py-2'>
              <span className='block text-xs text-grey-500'>Score</span>
              <span className='text-base font-semibold text-secondary-400'>{scorePercent}%</span>
              <span className='ml-2 text-xs text-grey-500'>{scoreLabel}</span>
            </div>
            <div className='rounded-xl bg-grey-50 px-3 py-2'>
              <span className='block text-xs text-grey-500'>Tentative</span>
              <span className='text-base font-semibold text-secondary-400'>
                {attemptResult.attemptNumber}
              </span>
              <span className='ml-2 text-xs text-grey-500'>/{attemptResult.maxAttempts}</span>
            </div>
            <div className='rounded-xl bg-grey-50 px-3 py-2'>
              <span className='block text-xs text-grey-500'>Restantes</span>
              <span className='text-base font-semibold text-secondary-400'>{remaining}</span>
            </div>
          </div>
        </div>

        <div className='space-y-4'>
          {questions.map((question, questionIndex) => {
            const answer = resultAnswers?.find(item => item.questionIndex === questionIndex);
            const selectedIndexes = normalizeIndexes(
              answer?.selectedOptionIndexes ?? selections[questionIndex] ?? []
            );
            const correctIndexes = normalizeIndexes(
              question.options
                .map((option, idx) => (option.isCorrect ? idx : null))
                .filter((idx): idx is number => idx !== null)
            );
            const isCorrect = arraysEqual(selectedIndexes, correctIndexes);

            return (
              <Card key={question.question} className='border-grey-200'>
                <CardContent className='space-y-4 p-5'>
                  <div className='flex items-start justify-between gap-4'>
                    <div>
                      <p className='text-sm font-semibold text-secondary-400'>
                        {questionIndex + 1}. {question.question}
                      </p>
                      <p className='mt-1 text-xs text-grey-500'>
                        {question.type === TypeQuestion.CHOIX_UNIQUE
                          ? 'Choix unique'
                          : 'Choix multiple'}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                        isCorrect
                          ? 'bg-success-100 text-success-700'
                          : 'bg-warning-100 text-warning-700'
                      }`}
                    >
                      {isCorrect ? 'Bonne réponse' : 'Réponse incorrecte'}
                    </span>
                  </div>

                  <div className='space-y-2'>
                    {question.options.map((option, optionIndex) => {
                      const isCorrectOption = option.isCorrect;
                      const isSelected = selectedIndexes.includes(optionIndex);

                      const optionClass = isCorrectOption
                        ? isSelected
                          ? 'border-success-300 bg-success-50 text-success-700'
                          : 'border-success-200 bg-success-50 text-success-700'
                        : isSelected
                          ? 'border-warning-300 bg-warning-50 text-warning-700'
                          : 'border-grey-200 bg-white text-grey-700';

                      return (
                        <div
                          key={`${question.question}-${option.text}`}
                          className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-2 text-sm ${optionClass}`}
                        >
                          <span>{option.text}</span>
                          <div className='flex items-center gap-2'>
                            {isCorrectOption ? (
                              <span className='rounded-full bg-success-100 px-2 py-0.5 text-[11px] font-semibold text-success-700'>
                                Bonne réponse
                              </span>
                            ) : isSelected ? (
                              <span className='rounded-full bg-warning-100 px-2 py-0.5 text-[11px] font-semibold text-warning-700'>
                                Votre réponse
                              </span>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {question.explication && (
                    <div className='rounded-xl bg-grey-50 px-4 py-3 text-sm text-grey-600'>
                      <span className='block text-xs font-semibold text-grey-500'>Explication</span>
                      {question.explication}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {passedQuiz ? (
          <Button
            type='button'
            onClick={() => router.push(afterSuccessRedirect)}
            className='rounded-full bg-primary-400 px-5 text-white shadow-primary-lg hover:bg-primary-300'
          >
            Continuer
          </Button>
        ) : (
          <div className='flex flex-wrap items-center gap-3'>
            <Button
              type='button'
              onClick={handleRetry}
              disabled={attemptResult.remainingAttempts <= 0}
              className='rounded-full bg-primary-400 px-5 text-white shadow-primary-lg hover:bg-primary-300 disabled:opacity-60'
            >
              Réessayer
            </Button>
            {attemptResult.remainingAttempts <= 0 && (
              <span className='text-xs text-warning-700'>
                Nombre maximal de tentatives atteint.
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-lg font-semibold text-secondary-400'>{quiz.title}</h2>
        <p className='mt-1 text-sm text-grey-600'>{quiz.description}</p>
      </div>

      {progress && (
        <div className='text-xs text-grey-500'>
          Tentatives restantes: <span className='font-semibold'>{progress.remainingAttempts}</span>
        </div>
      )}

      {/* Barre de progression */}
      <div className='space-y-2'>
        <p className='text-xs font-medium text-grey-600'>
          Question {currentIndex + 1} sur {total}
        </p>
        <div className='h-2 overflow-hidden rounded-full bg-grey-200'>
          <div
            className='h-full rounded-full bg-primary-400 transition-all duration-300'
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Carte question */}
      <Card className='overflow-hidden border-grey-200 bg-white shadow-sm'>
        <CardContent className='p-6'>
          <div className='flex gap-4'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-600'>
              {currentIndex + 1}
            </div>
            <div className='min-w-0 flex-1 space-y-4'>
              <p className='text-base font-medium text-secondary-400'>{current.question}</p>
              <fieldset className='space-y-2' aria-label='Options de réponse'>
                {current.options.map((opt, idx) => {
                  const isSelected = currentSelection.includes(idx);
                  return (
                    <label
                      key={`${current.question}-${opt.text}`}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${
                        isSelected
                          ? 'border-primary-400 bg-primary-50 text-secondary-400'
                          : 'border-grey-200 bg-white text-grey-700 hover:border-grey-300'
                      }`}
                    >
                      <input
                        type={current.type === TypeQuestion.CHOIX_UNIQUE ? 'radio' : 'checkbox'}
                        name={
                          current.type === TypeQuestion.CHOIX_UNIQUE
                            ? `q-${currentIndex}`
                            : undefined
                        }
                        checked={isSelected}
                        onChange={() => toggleOption(idx)}
                        className='h-4 w-4 border-grey-300 text-primary-600 focus:ring-primary-500'
                      />
                      <span>{opt.text}</span>
                    </label>
                  );
                })}
              </fieldset>
            </div>
          </div>
        </CardContent>
      </Card>

      {submitError && (
        <div
          role='alert'
          className='rounded-xl border border-warning-200 bg-warning-100 px-4 py-3 text-sm text-warning-700'
        >
          {submitError}
        </div>
      )}

      {noAttemptsLeft && (
        <div className='rounded-xl border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-700'>
          Nombre maximal de tentatives atteint pour ce quiz.
        </div>
      )}

      {/* Navigation */}
      <div className='flex items-center justify-between'>
        <Button
          type='button'
          variant='outline'
          disabled={isFirst}
          onClick={handlePrev}
          className='rounded-full border-grey-200 text-grey-700 hover:bg-grey-50 disabled:opacity-50'
        >
          <ChevronLeft className='mr-1 h-4 w-4' />
          Précédent
        </Button>
        <Button
          type='button'
          onClick={handleNext}
          disabled={!hasSelection || isSubmitting || (isLast && noAttemptsLeft)}
          className='rounded-full bg-primary-400 px-4 text-white shadow-primary-lg hover:bg-primary-300 disabled:opacity-60'
        >
          {isLast ? 'Terminer' : 'Suivant'}
          {!isLast && <ChevronRight className='ml-1 h-4 w-4' />}
        </Button>
      </div>
    </div>
  );
}
