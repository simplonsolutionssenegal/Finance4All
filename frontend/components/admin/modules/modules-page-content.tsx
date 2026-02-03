// frontend/src/components/admin/modules/modules-page-content.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';

import FiltersBar from '@/components/admin/modules/filters-bar';
import ModuleDialog from '@/components/admin/modules/module-dialog';
import ModuleList from '@/components/admin/modules/module-list';
import StatsCards from '@/components/admin/modules/stats-cards';
import { useLoader } from '@/contexts/LoaderContext';
import { useGetModules } from '@/hooks/module/useGetModules';

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

  // des hooks useMemo changent à chaque rendu lorsque `modules` est undefined.
  const allModules = useMemo(() => (Array.isArray(modules) ? modules : []), [modules]);

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

  // Loader global
  useEffect(() => {
    if (isLoading) showLoader();
    else hideLoader();
  }, [isLoading, showLoader, hideLoader]);

  // Statistiques
  const totalModules = allModules.length;
  const publishedModules = allModules.filter(m => m.status === 'PUBLISHED').length;

  // si tu veux garder ces chiffres en dur, ok. Sinon remplace par un calcul réel
  const totalQuizzes = 20;
  const totalLearners = 688;

  const handlePageChange = (page: number) => {
    setLocalPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Statistiques */}
        <StatsCards
          totalModules={totalModules}
          publishedModules={publishedModules}
          totalQuizzes={totalQuizzes}
          totalLearners={totalLearners}
        />

        {/* Actions rapides (juste le bouton) */}
        <FiltersBar onNewClick={() => setIsDialogOpen(true)} />

        {/* Liste des modules */}
        <ModuleList
          modules={paginatedModules}
          pagination={localPagination}
          isLoading={isLoading}
          isError={isError}
          onPageChange={handlePageChange}
        />

        {/* Dialog création/édition */}
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
