'use client';

import ComparatorIntelligent from '@/components/comparator/comparator-Intelligent';

export default function DashboardComparatorPage() {
  return (
    <div className='h-full w-full'>
      <div className='mb-6 lg:mt-0 mt-10'>
        <h1 className='text-2xl font-bold text-gray-900'>Comparateur</h1>
        <p className='text-gray-500'>Comparez les services financiers selon vos critères.</p>
      </div>

      <ComparatorIntelligent mode='dashboard' />
    </div>
  );
}
