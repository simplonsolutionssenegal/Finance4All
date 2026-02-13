'use client';

import { Clock, Play, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useEnrollModule } from '@/hooks/module/useEnrollModule';
import type { Lesson, LessonProgressStatus } from '@/types/learning/lesson';

interface LessonListProps {
  readonly moduleId: string;
  readonly lessons: Lesson[];
  readonly lessonStatuses: Map<string, LessonProgressStatus>;
}

export default function LessonList({ moduleId, lessons, lessonStatuses }: LessonListProps) {
  const router = useRouter();
  const { enrollModuleAsync, isEnrolling } = useEnrollModule();
  const [pendingLessonId, setPendingLessonId] = useState<string | null>(null);

  const handleStartLesson = async (lesson: Lesson) => {
    if (isEnrolling) return;

    setPendingLessonId(lesson.id);
    try {
      const result = await enrollModuleAsync({ moduleId });
      const ok = result?.success === true || result?.status === 'success' || result == null;
      if (!ok) return;

      router.push(`/learning/${moduleId}/lesson/${lesson.order}`);
    } catch (_error) {
      // Errors are already surfaced by the hook's toast handler.
    } finally {
      setPendingLessonId(null);
    }
  };

  return (
    <div className='space-y-3'>
      {lessons.map(lesson => {
        const status = lessonStatuses.get(lesson.id) ?? 'LOCKED';
        const isLocked = status === 'LOCKED';
        const isDone = status === 'DONE';
        const buttonLabel = isDone ? 'Revoir' : 'Continuer';
        const isPending = pendingLessonId === lesson.id && isEnrolling;

        return (
          <Card
            key={lesson.id}
            className={`flex items-center justify-between border-grey-200 shadow-sm ${
              isLocked ? 'bg-grey-50 opacity-80' : 'bg-white'
            }`}
          >
            <CardContent className='flex w-full items-center gap-4 p-4'>
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-grey-100 text-sm font-semibold text-grey-700'>
                {isLocked ? <Lock className='h-4 w-4 text-grey-500' /> : lesson.order}
              </div>

              <div className='min-w-0 flex-1 space-y-1'>
                <p className='text-sm font-semibold text-secondary-400'>{lesson.title}</p>
                <p className='text-xs text-grey-600'>{lesson.description}</p>
              </div>

              <div className='flex shrink-0 items-center gap-4 text-xs text-grey-500'>
                <span className='inline-flex items-center gap-1'>
                  <Clock className='h-4 w-4 text-grey-400' />
                  {lesson.duration} min
                </span>

                {!isLocked && (
                  <Button
                    size='sm'
                    disabled={isPending}
                    onClick={() => handleStartLesson(lesson)}
                    className='rounded-full bg-primary-400 px-4 text-xs font-medium text-white shadow-primary-lg hover:bg-primary-300'
                  >
                    <span className='inline-flex items-center gap-1'>
                      <Play className='h-3 w-3' />
                      {buttonLabel}
                    </span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
