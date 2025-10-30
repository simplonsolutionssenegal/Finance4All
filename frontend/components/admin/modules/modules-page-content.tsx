// frontend/src/components/admin/modules/modules-page-content.tsx

'use client';

import { useState, useMemo } from 'react';

import ContentTabs from '@/components/admin/modules/content-tabs';
import FiltersBar from '@/components/admin/modules/filters-bar';
import ModuleDialog from '@/components/admin/modules/module-dialog';
import ModuleList from '@/components/admin/modules/module-list';
import StatsCards from '@/components/admin/modules/stats-cards';
import QuizList from '@/components/admin/quiz/quiz-list';
import type { Module } from '@/types/modules/module';

interface ModulesPageContentProps {
  initialModules: Module[];
}

export default function ModulesPageContent({ initialModules }: ModulesPageContentProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // États des filtres - en dehors des tabs
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [thematicFilter, setThematicFilter] = useState('');
  // Filtrer les modules
  const filteredModules = useMemo(() => {
    return initialModules.filter(module => {
      // Filtre par recherche
      const matchesSearch =
        searchQuery === '' ||
        module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.description.toLowerCase().includes(searchQuery.toLowerCase());
      // Filtre par statut
      const matchesStatus = statusFilter === '' || module.status === statusFilter;
      // Filtre par thématique
      const matchesThematic =
        thematicFilter === '' || module.thematics.some(t => t === thematicFilter);
      return matchesSearch && matchesStatus && matchesThematic;
    });
  }, [initialModules, searchQuery, statusFilter, thematicFilter]);

  // Calculer les statistiques
  const totalModules = initialModules.length;
  const publishedModules = initialModules.filter(m => m.status === 'PUBLISHED').length;
  const totalQuizzes = 2;
  const totalLearners = 688;

  // Réinitialiser les filtres
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setThematicFilter('');
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
              {/* Barre de filtres */}
              <FiltersBar
                onNewClick={() => setIsDialogOpen(true)}
                buttonLabel={activeTab === 'modules' ? 'Nouveau module' : 'Nouveau quiz'}
                onSearchChange={setSearchQuery}
                onStatusChange={setStatusFilter}
                onThematicChange={setThematicFilter}
                searchValue={searchQuery}
                statusValue={statusFilter}
                thematicValue={thematicFilter}
                filteredModules={activeTab === 'modules' ? filteredModules : []}
              />

              {/* Message si aucun résultat */}
              {activeTab === 'modules' && filteredModules.length === 0 && (
                <div className='bg-white rounded-xl border border-gray-200 p-12 text-center'>
                  <p className='text-gray-500 mb-4'>
                    Aucun module ne correspond à vos critères de recherche
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              )}

              {/* Contenu selon le tab actif */}
              {activeTab === 'modules' && filteredModules.length > 0 && (
                <ModuleList modules={filteredModules} />
              )}

              {activeTab === 'quiz' && <QuizList />}
            </>
          )}
        </ContentTabs>

        {/* Dialog */}
        <ModuleDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
      </div>
    </div>
  );
}
