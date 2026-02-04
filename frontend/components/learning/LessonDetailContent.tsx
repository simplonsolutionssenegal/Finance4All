'use client';

import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  getChaptersForLesson,
  getChapterStatus,
  getChapterContent,
  getDefaultChapterId,
  getQuizForChapter,
  getQuizAvailability,
} from '@/lib/mocks/learning-mocks';
import type { Chapter } from '@/types/learning/lesson';

function LessonDetailFooter({
  moduleId,
  chapters,
  selectedChapterId,
  setSelectedChapterId,
  totalLessons,
}: {
  readonly moduleId: string;
  readonly chapters: Chapter[];
  readonly selectedChapterId: string | null;
  readonly setSelectedChapterId: (id: string) => void;
  readonly totalLessons: number;
}) {
  const currentIndex = selectedChapterId
    ? chapters.findIndex(ch => ch.id === selectedChapterId)
    : 0;
  const selectedChapter = chapters[currentIndex] ?? chapters[0];
  const isFirstChapter = currentIndex <= 0;
  const isLastChapter = currentIndex >= chapters.length - 1;

  let chapterQuiz: ReturnType<typeof getQuizForChapter> = null;
  if (selectedChapter) {
    chapterQuiz = getQuizForChapter(moduleId, selectedChapter.id);
  }
  let quizAvailable = false;
  if (chapterQuiz) {
    quizAvailable = getQuizAvailability(chapterQuiz, totalLessons).available;
  }

  const prevContent = isFirstChapter ? (
    <Link
      href={`/learning/${moduleId}`}
      className='inline-flex items-center gap-2 rounded-full border border-grey-300 bg-white px-4 py-2 text-sm text-grey-700 hover:bg-grey-50'
    >
      {'← '}
      Précédent
    </Link>
  ) : (
    <button
      type='button'
      onClick={() => setSelectedChapterId(chapters[currentIndex - 1].id)}
      className='inline-flex items-center gap-2 rounded-full border border-grey-300 bg-white px-4 py-2 text-sm text-grey-700 hover:bg-grey-50'
    >
      {'← '}
      Précédent
    </button>
  );

  let nextContent: React.ReactNode;
  if (quizAvailable && chapterQuiz) {
    nextContent = (
      <Link
        href={`/learning/${moduleId}/quiz/${chapterQuiz.id}`}
        className='inline-flex items-center gap-2 rounded-full bg-primary-400 px-5 py-2 text-sm font-medium text-white shadow-primary-lg hover:bg-primary-300'
      >
        Suivant <span className='text-base'>→</span>
      </Link>
    );
  } else if (isLastChapter === false) {
    nextContent = (
      <button
        type='button'
        onClick={() => setSelectedChapterId(chapters[currentIndex + 1].id)}
        className='inline-flex items-center gap-2 rounded-full bg-primary-400 px-5 py-2 text-sm font-medium text-white shadow-primary-lg hover:bg-primary-300'
      >
        Suivant <span className='text-base'>→</span>
      </button>
    );
  } else {
    nextContent = (
      <Link
        href={`/learning/${moduleId}`}
        className='inline-flex items-center gap-2 rounded-full bg-primary-400 px-5 py-2 text-sm font-medium text-white shadow-primary-lg hover:bg-primary-300'
      >
        Suivant <span className='text-base'>→</span>
      </Link>
    );
  }

  return (
    <footer className='mt-4 flex items-center justify-between'>
      {prevContent}
      {nextContent}
    </footer>
  );
}

interface LessonDetailContentProps {
  readonly moduleId: string;
  readonly lessonId: string;
  readonly lessonTitle: string;
  readonly lessonDescription: string;
  readonly totalLessons: number;
}

export default function LessonDetailContent({
  moduleId,
  lessonId,
  lessonTitle,
  lessonDescription,
  totalLessons,
}: LessonDetailContentProps) {
  const searchParams = useSearchParams();
  const chapterFromUrl = searchParams.get('chapter');
  const chapters = getChaptersForLesson(lessonId);
  const defaultChapterId = getDefaultChapterId(lessonId);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(
    () => chapterFromUrl ?? defaultChapterId
  );

  useEffect(() => {
    const chapterId = searchParams.get('chapter');
    const hasValidId = typeof chapterId === 'string' && chapterId.length > 0;
    if (hasValidId && chapterId && chapters.some(ch => ch.id === chapterId)) {
      setSelectedChapterId(chapterId);
    }
  }, [chapterFromUrl, chapters, searchParams]);

  const selectedChapter = chapters.find(ch => ch.id === selectedChapterId) ?? chapters[0];
  const chapterContent = selectedChapter ? getChapterContent(selectedChapter.id) : null;

  return (
    <main className='grid gap-6 rounded-3xl bg-transparent lg:grid-cols-[260px_minmax(0,1fr)]'>
      {/* Colonne gauche : carte menu leçon */}
      <aside className='lg:pt-4'>
        <div className='rounded-3xl bg-white px-5 py-6 shadow-primary-lg'>
          <h2 className='mb-4 text-sm font-semibold text-grey-900'>{lessonTitle}</h2>
          <div className='space-y-2'>
            {chapters.map(chapter => {
              const status = getChapterStatus(chapter.lessonId, chapter.order);
              const isSelected = chapter.id === selectedChapterId;

              if (status === 'CURRENT') {
                return (
                  <button
                    key={chapter.id}
                    type='button'
                    onClick={() => setSelectedChapterId(chapter.id)}
                    className={`w-full rounded-2xl px-4 py-2 text-left text-sm font-medium text-white transition-all ${
                      isSelected
                        ? 'bg-primary-400 shadow-md'
                        : 'bg-primary-400 hover:bg-primary-300'
                    }`}
                  >
                    {chapter.title}
                  </button>
                );
              }

              if (status === 'DONE') {
                return (
                  <button
                    key={chapter.id}
                    type='button'
                    onClick={() => setSelectedChapterId(chapter.id)}
                    className={`flex w-full items-center justify-between rounded-2xl px-4 py-2 text-left text-sm transition-all ${
                      isSelected
                        ? 'bg-primary-50 text-grey-900 ring-2 ring-primary-200'
                        : 'bg-grey-100 text-grey-900 hover:bg-grey-200'
                    }`}
                  >
                    <span>{chapter.title}</span>
                    <CheckCircle2 className='h-4 w-4 shrink-0 text-primary-600' />
                  </button>
                );
              }

              return (
                <div key={chapter.id} className='px-4 py-2 text-sm text-grey-400'>
                  {chapter.title}
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Colonne droite : vidéo + contenu */}
      <section className='space-y-8 border-t border-grey-100 px-6 pb-7 pt-6 lg:border-t-0 lg:px-8 lg:pb-8 lg:pt-8'>
        {/* Vidéo */}
        <div className='relative overflow-hidden rounded-3xl bg-grey-900'>
          <div className='relative aspect-[16/9] w-full'>
            <div className='absolute inset-0 bg-gradient-to-br from-grey-800 to-grey-900' />

            <button
              type='button'
              className='absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-primary-600 shadow-primary-lg'
            >
              <span className='ml-0.5 text-2xl'>▶</span>
            </button>

            <button
              type='button'
              className='absolute right-5 top-5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm'
            >
              🔊
            </button>
          </div>
        </div>

        {/* Contenu texte du chapitre */}
        <div>
          <h1 className='text-3xl font-semibold text-grey-900'>
            {selectedChapter?.title ?? lessonTitle}
          </h1>
          <p className='mt-3 text-base text-grey-600'>
            {selectedChapter?.description ?? lessonDescription}
          </p>
        </div>

        {/* Point clé */}
        {chapterContent?.keyPoint && (
          <div className='rounded-2xl border border-grey-200 bg-primary-50 px-6 py-4'>
            <div className='flex items-start gap-4'>
              <div className='mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-primary'>
                <span className='text-xl'>💡</span>
              </div>
              <div className='space-y-1'>
                <p className='text-sm font-semibold text-grey-900'>
                  {chapterContent.keyPoint.title}
                </p>
                <p className='text-sm text-grey-600'>{chapterContent.keyPoint.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Comment ça marche ? */}
        {chapterContent?.steps && chapterContent.steps.length > 0 && (
          <div className='space-y-3'>
            <h2 className='text-lg font-semibold text-grey-900'>Comment ça marche ?</h2>
            <ol className='space-y-2 text-sm text-grey-700'>
              {chapterContent.steps.map(step => (
                <li key={step.number}>
                  <span className='font-semibold'>{step.title} :</span> {step.description}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Exemple pratique */}
        {chapterContent?.practicalExample &&
          (() => {
            const example = chapterContent.practicalExample;
            return (
              <section className='mt-2 rounded-2xl border border-grey-200 bg-grey-50'>
                <header className='border-b border-grey-200 px-5 py-3'>
                  <p className='text-sm font-semibold text-grey-900'>{example.title}</p>
                </header>
                <div className='space-y-4 px-5 py-4'>
                  <p className='text-sm text-grey-700'>
                    <span className='font-semibold'>Situation :</span> {example.situation}
                  </p>

                  <div className='overflow-hidden rounded-xl border border-grey-200 bg-white text-sm'>
                    {example.details.map((detail, idx) => {
                      const isLast = idx === example.details.length - 1;
                      const isFirst = idx === 0;

                      let bgClass = 'text-grey-700';
                      if (detail.highlight) {
                        bgClass = 'bg-primary-50 font-semibold text-primary-700';
                      } else if (isFirst) {
                        bgClass = 'bg-grey-100 font-medium text-grey-700';
                      }

                      const borderClass = isLast ? '' : 'border-b border-grey-200';

                      return (
                        <div
                          key={`detail-${selectedChapter?.id ?? 'unknown'}-${detail.label}`}
                          className={`grid grid-cols-2 px-4 py-2 ${borderClass} ${bgClass}`}
                        >
                          <span>{detail.label}</span>
                          <span className='text-right'>{detail.value}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          })()}

        {/* Navigation bas */}
        <LessonDetailFooter
          moduleId={moduleId}
          chapters={chapters}
          selectedChapterId={selectedChapterId}
          setSelectedChapterId={setSelectedChapterId}
          totalLessons={totalLessons}
        />
      </section>
    </main>
  );
}
