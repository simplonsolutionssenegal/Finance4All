// frontend/src/components/admin/modules/modules-page-content.tsx

'use client';

import { useState, useEffect, useMemo } from 'react';

import ContentTabs from '@/components/admin/modules/content-tabs';
import FiltersBar from '@/components/admin/modules/filters-bar';
import ModuleDialog from '@/components/admin/modules/module-dialog';
import ModuleList from '@/components/admin/modules/module-list';
import StatsCards from '@/components/admin/modules/stats-cards';
import QuizList from '@/components/admin/quiz/quiz-list';
import { useLoader } from '@/contexts/LoaderContext';
import { useGetModules } from '@/hooks/module/useGetModules';
import type { Thematic } from '@/types/modules/module';

export default function ModulesPageContent() {
  const { showLoader, hideLoader } = useLoader();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const pageLimit = 100;

  // États des filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [thematicFilter, setThematicFilter] = useState<Thematic | ''>('');

  // Pagination locale
  const itemsPerPage = 6;
  const [localPage, setLocalPage] = useState(1);

  // Récupérer les modules
  const { modules, isLoading, isError, refetch } = useGetModules({
    page: 1,
    limit: pageLimit,
  });

  // Appliquer les filtres côté client
  const filteredModules = useMemo(() => {
    if (!Array.isArray(modules)) return [];

    return modules.filter(module => {
      // Filtre par recherche
      const searchLower = searchQuery.toLowerCase().trim();
      const matchesSearch =
        searchQuery === '' ||
        (module.title && module.title.toLowerCase().includes(searchLower)) ||
        (module.description && module.description.toLowerCase().includes(searchLower));

      // Filtre par statut
      const matchesStatus = statusFilter === '' || module.status === statusFilter;

      // Filtre par thématique
      const matchesThematic =
        thematicFilter === '' ||
        (Array.isArray(module.thematics) && module.thematics.includes(thematicFilter));

      return matchesSearch && matchesStatus && matchesThematic;
    });
  }, [modules, searchQuery, statusFilter, thematicFilter]);

  // Pagination locale
  const paginatedModules = useMemo(() => {
    const startIndex = (localPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredModules.slice(startIndex, endIndex);
  }, [filteredModules, localPage]);

  const localPagination = useMemo(() => {
    return {
      page: localPage,
      limit: itemsPerPage,
      total: filteredModules.length,
      totalPages: Math.ceil(filteredModules.length / itemsPerPage),
    };
  }, [filteredModules.length, localPage]);

  // Réinitialiser la page lors du changement de filtres
  useEffect(() => {
    setLocalPage(1);
  }, [searchQuery, statusFilter, thematicFilter]);

  // Gérer le loader global
  useEffect(() => {
    if (isLoading) {
      showLoader();
    } else {
      hideLoader();
    }
  }, [isLoading, showLoader, hideLoader]);

  // Statistiques
  const totalModules = modules.length;
  const publishedModules = modules.filter(m => m.status === 'PUBLISHED').length;
  const totalQuizzes = 2;
  const totalLearners = 688;

  // Gérer le changement de page
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

        {/* Tabs pour Modules / Quiz */}
        <ContentTabs>
          {activeTab => (
            <>
              {/* Barre de filtres */}
              <FiltersBar
                onNewClick={() => setIsDialogOpen(true)}
                buttonLabel={activeTab === 'modules' ? 'Nouveau module' : 'Nouveau quiz'}
                onSearchChange={setSearchQuery}
                onStatusChange={setStatusFilter}
                onThematicChange={value =>
                  setThematicFilter(value === '' ? '' : (value as Thematic))
                }
                searchValue={searchQuery}
                statusValue={statusFilter}
                thematicValue={thematicFilter}
                totalResults={filteredModules.length}
              />

              {/* Contenu principal */}
              {activeTab === 'modules' ? (
                <ModuleList
                  modules={paginatedModules}
                  pagination={localPagination}
                  isLoading={isLoading}
                  isError={isError}
                  onPageChange={handlePageChange}
                />
              ) : (
                <QuizList />
              )}
            </>
          )}
        </ContentTabs>

        {/* Dialog de création/édition */}
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
