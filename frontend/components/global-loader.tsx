'use client';

import { useLoader } from '@/contexts/LoaderContext';

export const GlobalLoader = () => {
  const { isLoading } = useLoader();

  if (!isLoading) return null;

  return (
    <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm'>
      <div className='flex flex-col items-center space-y-4'>
        <div className='relative'>
          <div className='h-12 w-12 rounded-full border-4 border-teal-200' />
          <div className='absolute top-0 h-12 w-12 animate-spin rounded-full border-4 border-transparent border-t-teal-500' />
        </div>
        <p className='text-white font-medium'>Chargement en cours...</p>
      </div>
    </div>
  );
};
