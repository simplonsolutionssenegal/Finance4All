import { auth } from '@clerk/nextjs/server';
import { BookOpen, Award, TrendingUp, Clock, Target, Trophy } from 'lucide-react';
import { redirect } from 'next/navigation';

import LessonCompletedSync from '@/components/learning/LessonCompletedSync';
import ModuleTabs from '@/components/learning/ModuleTabs';
import { Card, CardContent } from '@/components/ui/card';
import {
  mockTransfertsInternationauxModule,
  mockTransfertsLessons,
} from '@/lib/mocks/learning-mocks';

export default async function BeneficiaryModuleDetailPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

  // Pour l’instant on ne gère qu’un module mocké
  const moduleData = mockTransfertsInternationauxModule;
  const lessons = [...mockTransfertsLessons].sort((a, b) => a.order - b.order);

  const totalLessons = lessons.length;
  const completedLessons = 2; // mock pour illustrer 2/3 dans la maquette
  const quizzesPassed = 1;
  const averageScore = 85;
  const globalProgress = 67;

  return (
    <div className='min-h-[calc(100vh-3rem)] bg-grey-50 secondary-400'>
      <LessonCompletedSync />
      <div className='mx-auto flex max-w-5xl flex-col gap-8 px-4 pb-10 pt-4'>
        {/* Lien retour */}
        <button
          type='button'
          className='inline-flex items-center gap-2 text-sm text-grey-600 hover:text-primary-600 self-start'
        >
          <span className='inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm'>
            ←
          </span>{' '}
          Retour aux modules
        </button>

        {/* En-tête module */}
        <Card className='border-none bg-white shadow-secondary-lg'>
          <CardContent className='flex flex-col gap-6 p-6 md:flex-row'>
            {/* Image */}
            <div className='relative h-40 w-full overflow-hidden rounded-2xl bg-grey-900 md:h-48 md:w-72'>
              <div className='absolute inset-0 bg-gradient-to-br from-grey-800 to-grey-900' />
              <div className='absolute left-4 top-4 inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700'>
                Débutant
              </div>
            </div>

            {/* Texte */}
            <div className='flex-1 space-y-4'>
              <div>
                <h1 className='text-2xl font-semibold text-secondary-300'>{moduleData.title}</h1>
                <p className='mt-1 text-sm text-grey-600'>{moduleData.description}</p>
              </div>

              <div className='flex flex-wrap items-center gap-4 text-xs text-secondary-200'>
                <div className='inline-flex items-center gap-1'>
                  <BookOpen className='h-4 w-4 text-primary-600' />
                  <span>{totalLessons} leçons</span>
                </div>
                <div className='inline-flex items-center gap-1'>
                  <Award className='h-4 w-4 text-success-600' />
                  <span>Certificat inclus</span>
                </div>
                <div className='inline-flex items-center gap-1'>
                  <Clock className='h-4 w-4 text-warning-500' />
                  <span>{moduleData.estimatedDuration} min</span>
                </div>
              </div>

              {/* Progression barre */}
              <div className='space-y-2'>
                <div className='flex items-center justify-between text-xs text-grey-600'>
                  <span>Votre progression</span>
                  <span>{globalProgress}%</span>
                </div>
                <div className='relative h-2 overflow-hidden rounded-full bg-grey-200'>
                  <div
                    className='absolute inset-y-0 left-0 rounded-full bg-primary-400'
                    style={{ width: `${globalProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques rapides */}
        <div className='grid gap-4 md:grid-cols-4'>
          <Card className='border-grey-200 bg-white shadow-sm'>
            <CardContent className='space-y-2 p-4'>
              <div className='inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-50'>
                <BookOpen className='h-4 w-4 text-primary-600' />
              </div>
              <p className='text-xs textsecondary-300'>Leçons complétées</p>
              <p className='text-xl font-semibold text-secondary-400'>
                {completedLessons}/{totalLessons}
              </p>
            </CardContent>
          </Card>

          <Card className='border-grey-200 bg-white shadow-sm'>
            <CardContent className='space-y-2 p-4'>
              <div className='inline-flex h-9 w-9 items-center justify-center rounded-full bg-success-100'>
                <TrendingUp className='h-4 w-4 text-success-600' />
              </div>
              <p className='text-xs text-secondary-300'>Progression</p>
              <p className='text-xl font-semibold secondary-400'>{globalProgress}%</p>
            </CardContent>
          </Card>

          <Card className='border-grey-200 bg-white shadow-sm'>
            <CardContent className='space-y-2 p-4'>
              <div className='inline-flex h-9 w-9 items-center justify-center rounded-full bg-warning-100'>
                <Trophy className='h-4 w-4 text-warning-500' />
              </div>
              <p className='text-xs text-secondary-300'>Quiz réussis</p>
              <p className='text-xl font-semibold text-secondary-400'>{quizzesPassed}/0</p>
            </CardContent>
          </Card>

          <Card className='border-grey-200 bg-white shadow-sm'>
            <CardContent className='space-y-2 p-4'>
              <div className='inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-50'>
                <Target className='h-4 w-4 text-primary-600' />
              </div>
              <p className='text-xs text-secondary-300'>Score moyen</p>
              <p className='text-xl font-semibold secondary-400'>{averageScore}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Leçons / Quiz + contenu */}
        <div className='flex flex-col gap-4'>
          <ModuleTabs moduleId={moduleData.id} lessons={lessons} totalLessons={totalLessons} />
        </div>
      </div>
    </div>
  );
}
