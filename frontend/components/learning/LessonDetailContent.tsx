'use client';

import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import ChapterMedia from '@/components/learning/ChapterMedia';
import { QuizStatus, type Chapter, type Quiz } from '@/types/learning/lesson';

function LessonDetailFooter({
  moduleId,
  chapters,
  selectedChapterId,
  setSelectedChapterId,
  quizzes,
}: {
  readonly moduleId: string;
  readonly chapters: Chapter[];
  readonly selectedChapterId: string | null;
  readonly setSelectedChapterId: (id: string) => void;
  readonly quizzes: Quiz[];
}) {
  const computedIndex = selectedChapterId
    ? chapters.findIndex(ch => ch.id === selectedChapterId)
    : 0;
  const currentIndex = computedIndex < 0 ? 0 : computedIndex;
  const selectedChapter = chapters[currentIndex] ?? chapters[0];
  const isFirstChapter = currentIndex <= 0;
  const isLastChapter = currentIndex >= chapters.length - 1;

  const chapterQuiz =
    selectedChapter != null
      ? (quizzes.find(
          quiz => quiz.status === QuizStatus.PUBLISHED && quiz.chapterId === selectedChapter.id
        ) ?? null)
      : null;
  const lessonQuiz =
    selectedChapter != null
      ? (quizzes.find(
          quiz =>
            quiz.status === QuizStatus.PUBLISHED &&
            quiz.lessonId === selectedChapter.lessonId &&
            !quiz.chapterId
        ) ?? null)
      : null;

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
  if (chapterQuiz) {
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
  } else if (lessonQuiz) {
    nextContent = (
      <Link
        href={`/learning/${moduleId}/quiz/${lessonQuiz.id}`}
        className='inline-flex items-center gap-2 rounded-full bg-primary-400 px-5 py-2 text-sm font-medium text-white shadow-primary-lg hover:bg-primary-300'
      >
        Suivant <span className='text-base'>→</span>
      </Link>
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
  readonly lessonTitle: string;
  readonly lessonDescription: string;
  readonly chapters: Chapter[];
  readonly quizzes: Quiz[];
}

export default function LessonDetailContent({
  moduleId,
  lessonTitle,
  lessonDescription,
  chapters,
  quizzes,
}: LessonDetailContentProps) {
  const searchParams = useSearchParams();
  const chapterFromUrl = searchParams.get('chapter');
  const sortedChapters = useMemo(() => [...chapters].sort((a, b) => a.order - b.order), [chapters]);
  const defaultChapterId = sortedChapters[0]?.id ?? null;
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(
    () => chapterFromUrl ?? defaultChapterId
  );

  useEffect(() => {
    const chapterId = searchParams.get('chapter');
    const hasValidId = typeof chapterId === 'string' && chapterId.length > 0;
    if (hasValidId && chapterId && sortedChapters.some(ch => ch.id === chapterId)) {
      setSelectedChapterId(chapterId);
    }
  }, [chapterFromUrl, sortedChapters, searchParams]);

  useEffect(() => {
    if (!selectedChapterId && defaultChapterId) {
      setSelectedChapterId(defaultChapterId);
    }
  }, [defaultChapterId, selectedChapterId]);

  const selectedChapter =
    sortedChapters.find(ch => ch.id === selectedChapterId) ?? sortedChapters[0];

  return (
    <main className='grid gap-6 rounded-3xl bg-transparent lg:grid-cols-[260px_minmax(0,1fr)]'>
      {/* Colonne gauche : carte menu leçon */}
      <aside className='lg:pt-4'>
        <div className='rounded-3xl bg-white px-5 py-6 shadow-primary-lg'>
          <h2 className='mb-4 text-sm font-semibold text-grey-900'>{lessonTitle}</h2>
          <div className='space-y-2'>
            {sortedChapters.map(chapter => {
              const isSelected = chapter.id === selectedChapterId;

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
            })}
          </div>
        </div>
      </aside>

      <section className='space-y-8 border-t border-grey-100 px-6 pb-7 pt-6 lg:border-t-0 lg:px-8 lg:pb-8 lg:pt-8'>
        <ChapterMedia mediaId={selectedChapter?.mediaId} />
        {/* Contenu texte du chapitre */}
        <div>
          <h1 className='text-3xl font-semibold text-grey-900'>
            {selectedChapter?.title ?? lessonTitle}
          </h1>
          <p className='mt-3 text-base text-grey-600'>
            {selectedChapter?.description ?? lessonDescription}
          </p>
        </div>

        {/* Navigation bas */}
        <LessonDetailFooter
          moduleId={moduleId}
          chapters={sortedChapters}
          selectedChapterId={selectedChapterId}
          setSelectedChapterId={setSelectedChapterId}
          quizzes={quizzes}
        />
      </section>
    </main>
  );
}
