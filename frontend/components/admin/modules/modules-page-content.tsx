// frontend/src/components/admin/modules/modules-page-content.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';

import FiltersBar from '@/components/admin/modules/filters-bar';
import ModuleDialog from '@/components/admin/modules/module-dialog';
import ModuleList from '@/components/admin/modules/module-list';
import StatsCards from '@/components/admin/modules/stats-cards';
import { useLoader } from '@/contexts/LoaderContext';
import { useGetModules } from '@/hooks/module/useGetModules';
import type { Module } from '@/types/modules/module';

function countAllQuizzes(module: Module): number {
  // 1) quiz au niveau module
  const moduleQuizzes = Array.isArray(module.quizzes) ? module.quizzes.length : 0;

  // 2) quiz au niveau des chapitres (les leçons n'ont pas de quizzes directement)
  const lessons = Array.isArray(module.lessons) ? module.lessons : [];
  const chapterQuizzes = lessons.reduce((acc, l) => {
    const chapters = Array.isArray(l.chapters) ? l.chapters : [];
    return acc + chapters.reduce((a: number, c: any) => a + (c.quizzes?.length ?? 0), 0);
  }, 0);

  // 3) si ton backend renvoie quizzesGlobal déjà calculé
  // (dans ce cas, ça couvre tout; mais on l'utilise seulement si présent)
  const global = (module as any).quizzesGlobal;
  if (Array.isArray(global)) return global.length;

  return moduleQuizzes + chapterQuizzes;
}

export default function ModulesPageContent() {
  const { showLoader, hideLoader } = useLoader();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Pagination API (on récupère tout et on pagine côté client)
  const pageLimit = 100;

  // Pagination locale
  const itemsPerPage = 6;
  const [localPage, setLocalPage] = useState(1);

  const { modules, isLoading, isError, refetch } = useGetModules({
    page: 1,
    limit: pageLimit,
  });

  const allModules = useMemo(() => (Array.isArray(modules) ? modules : []), [modules]);

  // Loader global
  useEffect(() => {
    if (isLoading) showLoader();
    else hideLoader();
  }, [isLoading, showLoader, hideLoader]);

  // ✅ Stats dynamiques
  const totalModules = allModules.length;

  const publishedModules = useMemo(
    () => allModules.filter(m => m.status === 'PUBLISHED').length,
    [allModules]
  );

  const totalLessons = useMemo(
    () => allModules.reduce((acc, m) => acc + (m.lessons?.length ?? 0), 0),
    [allModules]
  );

  const totalQuizzes = useMemo(
    () => allModules.reduce((acc, m) => acc + countAllQuizzes(m), 0),
    [allModules]
  );

  // TODO: brancher une API "inscriptions" plus tard
  const totalLearners = useMemo(() => 0, []);

  // Pagination locale
  const paginatedModules = useMemo(() => {
    const startIndex = (localPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allModules.slice(startIndex, endIndex);
  }, [allModules, localPage]);

  const localPagination = useMemo(() => {
    const total = allModules.length;
    return {
      page: localPage,
      limit: itemsPerPage,
      total,
      totalPages: Math.ceil(total / itemsPerPage),
    };
  }, [allModules.length, localPage]);

  const handlePageChange = (page: number) => {
    setLocalPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto'>
        <StatsCards
          totalModules={totalModules}
          publishedModules={publishedModules}
          totalLessons={totalLessons}
          totalQuizzes={totalQuizzes}
          totalLearners={totalLearners}
        />

        <FiltersBar onNewClick={() => setIsDialogOpen(true)} />

        <ModuleList
          modules={paginatedModules}
          pagination={localPagination}
          isLoading={isLoading}
          isError={isError}
          onPageChange={handlePageChange}
        />

        <ModuleDialog
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            refetch();
          }}
        />
      </div>
    </div>
  );
}
