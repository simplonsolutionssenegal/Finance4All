'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { type QuestionDTO, TypeQuestion } from '@/types/learning/lesson';

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

export default function QuizRunner({ moduleId, quiz, afterSuccessRedirect }: QuizRunnerProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selections, setSelections] = useState<Record<number, string[]>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const questions = quiz.questions;
  const total = questions.length;
  const current = questions[currentIndex];
  const progressPercent = total > 0 ? ((currentIndex + 1) / total) * 100 : 0;

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === total - 1;

  const currentSelection = selections[currentIndex] ?? [];

  function toggleOption(optionIndex: number) {
    const optionText = current.options[optionIndex].text;
    if (current.type === TypeQuestion.CHOIX_UNIQUE) {
      setSelections(prev => ({ ...prev, [currentIndex]: [optionText] }));
      return;
    }
    setSelections(prev => {
      const arr = prev[currentIndex] ?? [];
      const next = arr.includes(optionText)
        ? arr.filter(t => t !== optionText)
        : [...arr, optionText];
      return { ...prev, [currentIndex]: next };
    });
  }

  function handlePrev() {
    if (!isFirst) setCurrentIndex(i => i - 1);
  }

  function computeScore(): { earned: number; total: number; percent: number } {
    let earned = 0;
    let total = 0;
    questions.forEach((q, idx) => {
      total += q.points;
      const selected = selections[idx] ?? [];
      const correctTexts = q.options.filter(o => o.isCorrect).map(o => o.text);
      const correct =
        q.type === TypeQuestion.CHOIX_UNIQUE
          ? selected.length === 1 && correctTexts.includes(selected[0])
          : correctTexts.length === selected.length &&
            correctTexts.every(t => selected.includes(t));
      if (correct) earned += q.points;
    });
    const percent = total > 0 ? Math.round((earned / total) * 100) : 0;
    return { earned, total, percent };
  }

  function handleNext() {
    if (isLast) {
      setSubmitError(null);
      const { percent } = computeScore();
      if (percent >= quiz.scoreMinimum) {
        router.push(afterSuccessRedirect);
        return;
      }
      setSubmitError(
        `Score insuffisant (${percent} %). Il faut au moins ${quiz.scoreMinimum} % pour réussir. Vous pouvez réessayer.`
      );
      return;
    }
    setCurrentIndex(i => i + 1);
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

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-lg font-semibold text-secondary-400'>{quiz.title}</h2>
        <p className='mt-1 text-sm text-grey-600'>{quiz.description}</p>
      </div>

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
                  const isSelected =
                    current.type === TypeQuestion.CHOIX_UNIQUE
                      ? currentSelection[0] === opt.text
                      : currentSelection.includes(opt.text);
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
          className='rounded-full bg-primary-400 px-4 text-white shadow-primary-lg hover:bg-primary-300'
        >
          {isLast ? 'Terminer' : 'Suivant'}
          {!isLast && <ChevronRight className='ml-1 h-4 w-4' />}
        </Button>
      </div>
    </div>
  );
}
