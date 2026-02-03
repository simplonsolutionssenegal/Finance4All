'use client';

import { ArrowLeft, Clock, Users, Plus, Pencil, FileText, SquareCheckBig } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLoader } from '@/contexts/LoaderContext';
import { useGetModuleById } from '@/hooks/module/useGetModuleById';
// import type { Lesson, Module } from '@/types/modules/module';
import {
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  THEMATIC_LABELS,
  THEMATIC_ICONS,
} from '@/lib/constants/module-constants';
import type { Lesson } from '@/types/modules/Lesson';

import LessonDialog from './lesson-dialog';
import LessonList from './lesson-list';
import QuizDialog from './quiz-dialog';
import QuizList from './quiz-list';

function minutesLabel(n: number) {
  const v = Math.round(n);
  return `${v}min`;
}

function sumLessonDuration(lessons: Lesson[]) {
  return lessons.reduce((acc, l) => acc + (Number(l.duration) || 0), 0);
}

function statusBadge(status: string) {
  const base = 'inline-flex items-center rounded-full px-2.5  text-xs font-medium border';

  switch (status) {
    case 'PUBLISHED':
      return `${base} bg-emerald-100 text-emerald-700 border-emerald-300`;
    case 'DRAFT':
      return `${base} bg-slate-100 text-slate-700 border-slate-300`;
    case 'ARCHIVED':
      return `${base} bg-amber-100 text-amber-800 border-amber-300`;
    case 'SCHEDULED':
      return `${base} bg-indigo-100 text-indigo-700 border-indigo-300`;
    default:
      return `${base} bg-slate-100 text-slate-700 border-slate-300`;
  }
}

function StatCard({
  icon,
  value,
  label,
  iconBgClass = 'bg-slate-50',
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  iconBgClass?: string;
}) {
  return (
    <div className='rounded-2xl bg-white shadow-sm border border-slate-100 p-6 min-h-[150px] flex flex-col'>
      <div className={`h-10 w-10 rounded-2xl ${iconBgClass} flex items-center justify-center`}>
        {icon}
      </div>

      <div className='mt-4 text-[34px] leading-none text-slate-900'>{value}</div>
      <div className='mt-4 text-sm text-slate-500'>{label}</div>
    </div>
  );
}

export default function ModuleDetailsComponent({ moduleId }: { moduleId: string }) {
  const { showLoader, hideLoader } = useLoader();
  const { module, isLoading, isError, refetch } = useGetModuleById(moduleId);
  const [activeTab, setActiveTab] = useState<'lessons' | 'quiz'>('lessons');
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);

  useEffect(() => {
    if (isLoading) showLoader();
    else hideLoader();
  }, [isLoading, showLoader, hideLoader]);

  const lessonsSorted = useMemo(() => {
    const list = module?.lessons ?? [];
    return [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [module?.lessons]);

  const nextOrder = (lessonsSorted.length ?? 0) + 1;
  const totalLessons = lessonsSorted.length;
  const totalDuration =
    totalLessons > 0 ? sumLessonDuration(lessonsSorted) : (module?.estimatedDuration ?? 0);

  // const enrolledCount = 189;

  if (isError) {
    return (
      <div className='min-h-screen bg-slate-950 text-white p-6'>
        <div className='max-w-6xl mx-auto'>
          <p className='text-red-300'>Erreur lors du chargement du module.</p>
          <Link href='/modules' className='inline-flex items-center gap-2 mt-4 text-sky-300'>
            <ArrowLeft className='h-4 w-4' /> Retour
          </Link>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className='min-h-screen p-6'>
        <div className='max-w-6xl mx-auto'>
          <div className='rounded-2xl bg-white border border-slate-100 shadow-sm p-10 text-center'>
            <div className='mx-auto mb-4 h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center'>
              <FileText className='h-6 w-6 text-slate-400' />
            </div>

            <p className='text-slate-900 font-medium text-lg'>Module introuvable</p>
            <p className='mt-1 text-sm text-slate-500'>Ce module n’existe pas ou a été supprimé.</p>

            <Link
              href='/modules'
              className='mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 text-sm font-medium'
            >
              <ArrowLeft className='h-4 w-4' />
              Retour aux modules
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const thematic = module.thematics?.[0];
  const thematicLabel = thematic ? THEMATIC_LABELS[thematic] : 'Thématique';
  const thematicIcon = thematic ? THEMATIC_ICONS[thematic] : '📘';

  const quizzesGlobal = module.quizzesGlobal ?? [];
  const quizCount = quizzesGlobal.length;
  return (
    <div className='min-h-screen text-white p-4'>
      <div className='max-w-6xl mx-auto space-y-6'>
        {/* Top bar */}
        {/* Retour */}
        <div>
          <Link
            href='/modules'
            className='inline-flex items-center gap-2 text-gray-600 hover:text-gray-900'
          >
            <ArrowLeft className='h-4 w-4' />
            Retour aux modules
          </Link>
        </div>

        {/* Header + bouton modifier aligné */}
        <div className='flex items-start justify-between gap-6'>
          {/* Bloc gauche (image + infos) */}
          <div className='flex items-start gap-4 min-w-0'>
            <div className='h-16 w-16 rounded-2xl overflow-hidden bg-slate-800 shrink-0 flex items-center justify-center'>
              {module.imageUrl ? (
                <Image src={module.imageUrl} alt={module.title} width={64} height={64} />
              ) : (
                <span className='text-3xl'>{thematicIcon}</span>
              )}
            </div>

            <div className='flex-1 min-w-0'>
              <h1 className='text-4xl tracking-tight text-tertiary-400'>{module.title}</h1>

              <div className='mt-2 flex flex-wrap items-center gap-2'>
                <span className='inline-flex  items-center rounded-full border border-slate-500/50 px-3 text-xs  text-slate-900'>
                  {thematicLabel}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-3 text-xs font-medium ${DIFFICULTY_COLORS[module.difficultyLevel]}`}
                >
                  {DIFFICULTY_LABELS[module.difficultyLevel]}
                </span>
                <span className={statusBadge(module.status)}>{module.status}</span>
              </div>
            </div>
          </div>

          {/* Bloc droit (bouton modifier) */}
          <button className='inline-flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 text-sm font-medium shrink-0'>
            <Pencil className='h-4 w-4' />
            Modifier
          </button>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <StatCard
            icon={<FileText className='h-5 w-5 text-primary-400' />}
            iconBgClass='bg-primary-50'
            value={totalLessons}
            label='Leçons'
          />

          <StatCard
            icon={<SquareCheckBig className='h-5 w-5 text-orange-700' />}
            iconBgClass='bg-orange-50'
            value={quizCount}
            label='Quiz module'
          />

          <StatCard
            icon={<Clock className='h-5 w-5 text-violet-500' />}
            iconBgClass='bg-violet-50'
            value={minutesLabel(totalDuration)}
            label='Durée totale'
          />

          <StatCard
            icon={<Users className='h-5 w-5 text-sky-500' />}
            iconBgClass='bg-sky-50'
            value={quizCount}
            label='Inscrits'
          />
        </div>
        <div className='mt-4'>
          <Tabs
            defaultValue='lessons'
            value={activeTab}
            onValueChange={v => setActiveTab(v as 'lessons' | 'quiz')}
            className='w-full'
          >
            <TabsList className='w-full justify-start overflow-x-auto bg-[#E9ECEF] p-1 rounded-full gap-1'>
              <TabsTrigger
                value='lessons'
                className='group inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-normal
          text-gray-700 hover:text-gray-900 data-[state=active]:bg-white
          data-[state=active]:text-gray-900 transition'
              >
                <FileText className='h-4 w-4 text-gray-600 group-data-[state=active]:text-gray-900' />
                Leçons ({totalLessons})
              </TabsTrigger>

              <TabsTrigger
                value='quiz'
                className='group inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-normal
          text-gray-700 hover:text-gray-900 data-[state=active]:bg-white
          data-[state=active]:text-gray-900 transition'
              >
                <SquareCheckBig className='h-4 w-4 text-gray-600 group-data-[state=active]:text-gray-900' />
                Quiz ({quizCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value='lessons' className='mt-4'>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <p className='text-slate-700'>Gérez les leçons de ce module</p>
                  <button
                    onClick={() => setIsLessonDialogOpen(true)}
                    className='inline-flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 text-sm font-medium'
                  >
                    <Plus className='h-4 w-4' />
                    Nouvelle leçon
                  </button>
                </div>
                <LessonList
                  lessons={lessonsSorted}
                  moduleId={moduleId}
                  onCreate={() => setIsLessonDialogOpen(true)}
                  onEdit={lesson => {
                    // ici tu ouvres ton formulaire d’édition (dialog/side panel) avec la lesson
                    console.log('edit lesson', lesson);
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value='quiz' className='mt-4'>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <p className='text-slate-700'>Gérez les quiz de ce module</p>

                  <button
                    onClick={() => setIsQuizDialogOpen(true)}
                    className='inline-flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 text-sm font-medium'
                  >
                    <Plus className='h-4 w-4' />
                    Nouveau quiz
                  </button>
                </div>

                <QuizList quizzes={quizzesGlobal} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <LessonDialog
          open={isLessonDialogOpen}
          onOpenChange={setIsLessonDialogOpen}
          moduleId={moduleId}
          nextOrder={nextOrder}
          onCreated={() => refetch()}
        />
        <QuizDialog
          open={isQuizDialogOpen}
          onOpenChange={setIsQuizDialogOpen}
          moduleId={moduleId}
          onCreated={() => refetch()}
        />
      </div>
    </div>
  );
}
