'use client';

import { Clock, Play } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Lesson } from '@/types/learning/lesson';

interface LessonListProps {
  readonly moduleId: string;
  readonly lessons: Lesson[];
}

export default function LessonList({ moduleId, lessons }: LessonListProps) {
  return (
    <div className='space-y-3'>
      {lessons.map(lesson => {
        const buttonLabel = 'Commencer';

        return (
          <Card
            key={lesson.id}
            className='flex items-center justify-between border-grey-200 bg-white shadow-sm'
          >
            <CardContent className='flex w-full items-center gap-4 p-4'>
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-grey-100 text-sm font-semibold text-grey-700'>
                {lesson.order}
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

                <Link href={`/learning/${moduleId}/lesson/${lesson.order}`}>
                  <Button
                    size='sm'
                    className='rounded-full bg-primary-400 px-4 text-xs font-medium text-white shadow-primary-lg hover:bg-primary-300'
                  >
                    <span className='inline-flex items-center gap-1'>
                      <Play className='h-3 w-3' />
                      {buttonLabel}
                    </span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
