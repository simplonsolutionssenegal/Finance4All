'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';

import ModuleDialog from '@/components/admin/modules/module-dialog';
import ModuleList from '@/components/admin/modules/module-list';
import type { Module } from '@/types/modules/module';

interface ModulesPageContentProps {
  initialModules: Module[];
}

export default function ModulesPageContent({ initialModules }: ModulesPageContentProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* En-tête */}
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>Modules de formation</h1>
          </div>

          <button
            onClick={() => setIsDialogOpen(true)}
            className='flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors'
          >
            <Plus size={20} />
            Nouveau module
          </button>
        </div>

        {/* Liste des modules */}
        <ModuleList modules={initialModules} />

        {/* Dialog Modal */}
        <ModuleDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
      </div>
    </div>
  );
}
