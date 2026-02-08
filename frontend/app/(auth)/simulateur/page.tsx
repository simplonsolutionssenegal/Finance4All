'use client';

import { ServiceSimulator } from '@/components/service-simulator/service-simulator';

export default function DashboardSimulatorPage() {
  return (
    <div className='h-full w-full'>
      <div className='mb-6 px-4 lg:mt-0 mt-10'>
        <h1 className='text-2xl font-bold text-gray-900'>Simulateur</h1>
        <p className='text-gray-500'>Estimez vos frais de transaction en temps réel.</p>
      </div>

      <ServiceSimulator mode='dashboard' />
    </div>
  );
}
