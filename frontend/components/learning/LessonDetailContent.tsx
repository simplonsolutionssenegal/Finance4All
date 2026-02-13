'use client';

import DOMPurify from 'dompurify';
import { CheckCircle2, CircleDot, Lock } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import ChapterMedia from '@/components/learning/ChapterMedia';
import { useQuizProgressMap } from '@/hooks/quiz/useQuizProgressMap';
import {
  QuizStatus,
  type Chapter,
  type Quiz,
  type ChapterProgressStatus,
} from '@/types/learning/lesson';

type ChapterState = {
  status: ChapterProgressStatus;
  isComplete: boolean;
  pendingQuizId: string | null;
};

function LessonDetailFooter({
  moduleId,
  chapters,
  selectedChapterId,
  onSelectChapter,
  chapterStates,
  pendingLessonQuizId,
}: {
  readonly moduleId: string;
  readonly chapters: Chapter[];
  readonly selectedChapterId: string | null;
  readonly onSelectChapter: (id: string) => void;
  readonly chapterStates: Map<string, ChapterState>;
  readonly pendingLessonQuizId: string | null;
}) {
  const computedIndex = selectedChapterId
    ? chapters.findIndex(ch => ch.id === selectedChapterId)
    : 0;
  const currentIndex = computedIndex < 0 ? 0 : computedIndex;
  const selectedChapter = chapters[currentIndex] ?? chapters[0];
  const isFirstChapter = currentIndex <= 0;
  const isLastChapter = currentIndex >= chapters.length - 1;

  const selectedChapterState = selectedChapter ? chapterStates.get(selectedChapter.id) : null;
  const pendingChapterQuizId = selectedChapterState?.pendingQuizId ?? null;

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
      onClick={() => onSelectChapter(chapters[currentIndex - 1].id)}
      className='inline-flex items-center gap-2 rounded-full border border-grey-300 bg-white px-4 py-2 text-sm text-grey-700 hover:bg-grey-50'
    >
      {'← '}
      Précédent
    </button>
  );

  let nextContent: React.ReactNode;
  if (pendingChapterQuizId) {
    nextContent = (
      <Link
        href={`/learning/${moduleId}/quiz/${pendingChapterQuizId}`}
        className='inline-flex items-center gap-2 rounded-full bg-primary-400 px-5 py-2 text-sm font-medium text-white shadow-primary-lg hover:bg-primary-300'
      >
        Quiz <span className='text-base'>→</span>
      </Link>
    );
  } else if (isLastChapter === false) {
    nextContent = (
      <button
        type='button'
        onClick={() => onSelectChapter(chapters[currentIndex + 1].id)}
        className='inline-flex items-center gap-2 rounded-full bg-primary-400 px-5 py-2 text-sm font-medium text-white shadow-primary-lg hover:bg-primary-300'
      >
        Suivant <span className='text-base'>→</span>
      </button>
    );
  } else if (pendingLessonQuizId) {
    nextContent = (
      <Link
        href={`/learning/${moduleId}/quiz/${pendingLessonQuizId}`}
        className='inline-flex items-center gap-2 rounded-full bg-primary-400 px-5 py-2 text-sm font-medium text-white shadow-primary-lg hover:bg-primary-300'
      >
        Quiz <span className='text-base'>→</span>
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
  readonly lessonId: string;
  readonly lessonTitle: string;
  readonly lessonDescription: string;
  readonly chapters: Chapter[];
  readonly quizzes: Quiz[];
}

export default function LessonDetailContent({
  moduleId,
  lessonId,
  lessonTitle,
  lessonDescription,
  chapters,
  quizzes,
}: LessonDetailContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const chapterFromUrl = searchParams.get('chapter');
  const sortedChapters = useMemo(() => [...chapters].sort((a, b) => a.order - b.order), [chapters]);
  const quizIds = useMemo(() => quizzes.map(quiz => quiz.id), [quizzes]);
  const { progressMap } = useQuizProgressMap(quizIds);
  const storageKey = useMemo(() => `learning:lastChapter:${lessonId}`, [lessonId]);

  const chapterStates = useMemo(() => {
    const states = new Map<string, ChapterState>();
    let unlocked = true;
    const isQuizPassed = (quizId: string) => progressMap.get(quizId)?.hasPassed === true;

    sortedChapters.forEach(chapter => {
      const chapterQuizzes = quizzes.filter(
        quiz => quiz.status === QuizStatus.PUBLISHED && quiz.chapterId === chapter.id
      );
      const pendingQuiz = chapterQuizzes.find(quiz => !isQuizPassed(quiz.id)) ?? null;
      const isComplete = chapterQuizzes.length === 0 || !pendingQuiz;

      let status: ChapterProgressStatus = 'LOCKED';
      if (unlocked) {
        status = isComplete ? 'DONE' : 'CURRENT';
      }

      states.set(chapter.id, {
        status,
        isComplete,
        pendingQuizId: pendingQuiz?.id ?? null,
      });

      if (unlocked && !isComplete) {
        unlocked = false;
      }
    });

    return states;
  }, [sortedChapters, quizzes, progressMap]);

  const lastAccessibleChapterId = useMemo(() => {
    const accessible = sortedChapters.filter(
      chapter => chapterStates.get(chapter.id)?.status !== 'LOCKED'
    );
    const lastAccessible = accessible[accessible.length - 1]?.id;
    const lastChapter = sortedChapters[sortedChapters.length - 1]?.id;
    return lastAccessible ?? lastChapter ?? null;
  }, [sortedChapters, chapterStates]);

  const pendingLessonQuizId = useMemo(() => {
    const isQuizPassed = (quizId: string) => progressMap.get(quizId)?.hasPassed === true;
    const lessonQuizzes = quizzes.filter(
      quiz => quiz.status === QuizStatus.PUBLISHED && quiz.lessonId === lessonId && !quiz.chapterId
    );
    const pendingQuiz = lessonQuizzes.find(quiz => !isQuizPassed(quiz.id)) ?? null;
    return pendingQuiz?.id ?? null;
  }, [quizzes, lessonId, progressMap]);

  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);

  const persistChapterId = useCallback(
    (id: string) => {
      try {
        localStorage.setItem(storageKey, id);
      } catch {
        // ignore storage errors
      }
    },
    [storageKey]
  );

  const updateChapterParam = useCallback(
    (id: string) => {
      const current = searchParams.get('chapter');
      if (current === id) return;
      const params = new URLSearchParams(searchParams.toString());
      params.set('chapter', id);
      const nextUrl = `${pathname}?${params.toString()}`;
      router.replace(nextUrl, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  const selectChapter = useCallback(
    (id: string, syncUrl = true) => {
      setSelectedChapterId(id);
      persistChapterId(id);
      if (syncUrl) updateChapterParam(id);
    },
    [persistChapterId, updateChapterParam]
  );

  useEffect(() => {
    const chapterId = chapterFromUrl;
    if (!chapterId) return;
    const chapterExists = sortedChapters.some(ch => ch.id === chapterId);
    const isLocked = chapterStates.get(chapterId)?.status === 'LOCKED';

    if (chapterExists && !isLocked && chapterId !== selectedChapterId) {
      selectChapter(chapterId, false);
    }
  }, [chapterFromUrl, sortedChapters, chapterStates, selectedChapterId, selectChapter]);

  useEffect(() => {
    if (selectedChapterId || sortedChapters.length === 0) return;

    let stored: string | null = null;
    try {
      stored = localStorage.getItem(storageKey);
    } catch {
      stored = null;
    }

    const candidates = [chapterFromUrl, stored, lastAccessibleChapterId];
    const nextId =
      candidates.find(id => {
        if (!id) return false;
        const exists = sortedChapters.some(ch => ch.id === id);
        const isLocked = chapterStates.get(id)?.status === 'LOCKED';
        return exists && !isLocked;
      }) ??
      sortedChapters[0]?.id ??
      null;

    if (nextId) {
      selectChapter(nextId, !chapterFromUrl || chapterFromUrl !== nextId);
    }
  }, [
    selectedChapterId,
    chapterFromUrl,
    lastAccessibleChapterId,
    sortedChapters,
    chapterStates,
    storageKey,
    selectChapter,
  ]);

  const selectedChapter =
    sortedChapters.find(ch => ch.id === selectedChapterId) ?? sortedChapters[0];
  const chapterDescriptionHtml = useMemo(() => {
    const raw = selectedChapter?.description ?? lessonDescription ?? '';
    return raw ? DOMPurify.sanitize(raw) : '';
  }, [selectedChapter?.description, lessonDescription]);

  return (
    <main className='grid gap-6 rounded-3xl bg-transparent lg:grid-cols-[260px_minmax(0,1fr)]'>
      {/* Colonne gauche : carte menu leçon */}
      <aside className='lg:pt-4'>
        <div className='rounded-3xl bg-white px-5 py-6 shadow-primary-lg'>
          <h2 className='mb-4 text-sm font-semibold text-grey-900'>{lessonTitle}</h2>
          <div className='space-y-2'>
            {sortedChapters.map(chapter => {
              const isSelected = chapter.id === selectedChapterId;
              const chapterState = chapterStates.get(chapter.id);
              const isLocked = chapterState?.status === 'LOCKED';
              const isDone = chapterState?.status === 'DONE';

              return (
                <button
                  key={chapter.id}
                  type='button'
                  onClick={() => {
                    if (!isLocked) {
                      selectChapter(chapter.id);
                    }
                  }}
                  disabled={isLocked}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-2 text-left text-sm transition-all ${
                    isSelected
                      ? 'bg-primary-50 text-grey-900 ring-2 ring-primary-200'
                      : isLocked
                        ? 'cursor-not-allowed bg-grey-50 text-grey-400'
                        : 'bg-grey-100 text-grey-900 hover:bg-grey-200'
                  }`}
                >
                  <span>{chapter.title}</span>
                  {isLocked ? (
                    <Lock className='h-4 w-4 shrink-0 text-grey-400' />
                  ) : isDone ? (
                    <CheckCircle2 className='h-4 w-4 shrink-0 text-success-600' />
                  ) : (
                    <CircleDot className='h-4 w-4 shrink-0 text-primary-600' />
                  )}
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
          <div
            className='mt-3 text-base text-grey-600'
            dangerouslySetInnerHTML={{ __html: chapterDescriptionHtml }}
          />
        </div>

        {/* Navigation bas */}
        <LessonDetailFooter
          moduleId={moduleId}
          chapters={sortedChapters}
          selectedChapterId={selectedChapterId}
          onSelectChapter={selectChapter}
          chapterStates={chapterStates}
          pendingLessonQuizId={pendingLessonQuizId}
        />
      </section>
    </main>
  );
}
