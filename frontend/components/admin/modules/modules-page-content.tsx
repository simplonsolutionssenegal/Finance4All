// frontend/src/components/admin/modules/modules-page-content.tsx

'use client';

import { useState, useEffect } from 'react';

import ContentTabs from '@/components/admin/modules/content-tabs';
import FiltersBar from '@/components/admin/modules/filters-bar';
import ModuleDialog from '@/components/admin/modules/module-dialog';
import ModuleList from '@/components/admin/modules/module-list';
import StatsCards from '@/components/admin/modules/stats-cards';
import QuizList from '@/components/admin/quiz/quiz-list';
import { useLoader } from '@/contexts/LoaderContext';
import { useGetModules } from '@/hooks/module/useGetModules';

export default function ModulesPageContent() {
  const { showLoader, hideLoader } = useLoader();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageLimit = 3;

  // Récupérer les modules avec pagination
  const { modules, pagination, isLoading, isError, refetch } = useGetModules({
    page: currentPage,
    limit: pageLimit,
  });

  // Gérer le loader global
  useEffect(() => {
    if (isLoading) {
      showLoader();
    } else {
      hideLoader();
    }
  }, [isLoading, showLoader, hideLoader]);

  // Filtres (optionnel - vous pouvez les ajouter plus tard)
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [thematicFilter, setThematicFilter] = useState('');

  // Statistiques
  const totalModules = pagination?.total || 0;
  const publishedModules = modules.filter(m => m.status === 'PUBLISHED').length;
  const totalQuizzes = 2;
  const totalLearners = 688;

  // Gérer le changement de page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Cards statistiques avec en-tête */}
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
              <FiltersBar
                onNewClick={() => setIsDialogOpen(true)}
                buttonLabel={activeTab === 'modules' ? 'Nouveau module' : 'Nouveau quiz'}
                onSearchChange={setSearchQuery}
                onStatusChange={setStatusFilter}
                onThematicChange={setThematicFilter}
                searchValue={searchQuery}
                statusValue={statusFilter}
                thematicValue={thematicFilter}
              />

              {activeTab === 'modules' ? (
                <ModuleList
                  modules={modules}
                  pagination={pagination}
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

        {/* Dialog */}
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
