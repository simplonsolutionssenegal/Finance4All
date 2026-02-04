import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import LessonDetailContent from '@/components/learning/LessonDetailContent';
import { getLessonContextByOrder } from '@/lib/mocks/learning-mocks';

interface LessonPageProps {
  readonly params: Promise<{ readonly moduleId: string; readonly order: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

  const { moduleId, order: orderParam } = await params;
  const order = Number(orderParam) || 1;
  const context = getLessonContextByOrder(order);

  const currentIndex = context ? context.currentIndex + 1 : order;
  const totalLessons = context?.totalLessons ?? 4;

  const headerProgress = totalLessons > 0 ? (currentIndex / totalLessons) * 100 : 0;

  const lessonId = context?.currentLesson.id;
  const lessonTitle = context?.currentLesson.title ?? 'Transferts internationaux';
  const lessonDescription =
    context?.currentLesson.description ??
    "Découvrez comment envoyer de l'argent à l'international en toute sécurité et au meilleur tarif.";

  return (
    <div className='min-h-screen bg-grey-50 text-grey-900'>
      <div className='mx-auto flex max-w-5xl flex-col gap-6 px-6 pb-12 pt-6'>
        {/* Barre supérieure : retour module + progression leçon */}
        <header className='space-y-2'>
          <div className='flex items-center justify-between text-sm'>
            <Link
              href={`/learning/${moduleId}`}
              className='inline-flex items-center gap-2 text-xs text-grey-700 hover:text-primary-600'
            >
              <span className='text-base'>←</span>
              <span>Retour au module</span>
            </Link>

            <span className='text-xs font-medium text-grey-500'>
              Leçon {currentIndex} sur {totalLessons}
            </span>
          </div>

          <div className='h-1 w-full overflow-hidden rounded-full bg-grey-200'>
            <div
              className='h-full rounded-full bg-primary-400'
              style={{ width: `${headerProgress}%` }}
            />
          </div>
        </header>

        {/* Carte principale avec colonne gauche (menu leçon) + droite (vidéo + contenu) */}
        {lessonId ? (
          <LessonDetailContent
            moduleId={moduleId}
            lessonId={lessonId}
            lessonOrder={order}
            lessonTitle={lessonTitle}
            lessonDescription={lessonDescription}
            totalLessons={totalLessons}
          />
        ) : (
          <div className='rounded-3xl bg-white p-8 text-center text-grey-600'>
            Leçon introuvable
          </div>
        )}
      </div>
    </div>
  );
}
