// frontend/src/components/modules/module-list.tsx

import type { Module } from '@/types/modules/module';

import ModuleCard from './module-card';

interface ModuleListProps {
  modules: Module[];
}

export default function ModuleList({ modules }: ModuleListProps) {
  if (modules.length === 0) {
    return (
      <div className='text-center py-12'>
        <p className='text-gray-500 text-lg'>Aucun module trouvé</p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {modules.map(module => (
        <ModuleCard key={module.id} module={module} />
      ))}
    </div>
  );
}
