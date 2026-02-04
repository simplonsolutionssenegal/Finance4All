'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { markLessonCompleted } from '@/lib/mocks/learning-mocks';

/**
 * Applique ?lessonCompleted=lessonId en appelant markLessonCompleted puis retire le param de l’URL.
 * À placer sur la page détail module pour débloquer la leçon suivante après succès du quiz de leçon.
 */
export default function LessonCompletedSync() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const lessonId = searchParams.get('lessonCompleted');
    if (!lessonId) return;
    markLessonCompleted(lessonId);
    router.replace(pathname ?? '/learning');
  }, [pathname, router, searchParams]);

  return null;
}
