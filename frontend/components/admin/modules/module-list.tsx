// frontend/src/components/modules/module-list.tsx

'use client';

import { ArrowRight, Loader2 } from 'lucide-react';

import { CustomPagination } from './custom-pagination';
import ModuleCard from './module-card';

import type { Module } from '@/types/modules/module';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ModuleListProps {
  modules: Module[];
  pagination?: PaginationInfo;
  isLoading?: boolean;
  isError?: boolean;
  onPageChange?: (page: number) => void;
}

export default function ModuleList({
  modules,
  pagination,
  isLoading = false,
  isError = false,
  onPageChange,
}: ModuleListProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader2 className='w-8 h-8 animate-spin text-sky-400' />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className='flex flex-col justify-center items-center py-12 gap-4'>
        <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center'>
          <svg
            className='w-8 h-8 text-red-600'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </div>
        <p className='text-red-600 text-center font-medium'>
          Erreur lors du chargement des modules
        </p>
      </div>
    );
  }

  // Empty state
  if (modules.length === 0) {
    return (
      <div className='flex justify-center items-center py-12'>
        <div className='text-center'>
          <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <svg
              className='w-8 h-8 text-gray-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
              />
            </svg>
          </div>
          <p className='text-gray-500 text-lg'>Aucun module trouvé</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      <div className='w-full flex items-center justify-between  rounded-md px-3 py-2 bg-white'>
        <h2 className='text-base font-medium text-gray-700'>Modules récents</h2>

        <button
          type='button'
          className='inline-flex items-center gap-2 text-sm text-gray-700 border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50 transition-colors'
        >
          Voir tout
          <ArrowRight className='w-4 h-4' />
        </button>
      </div>

      {/* Grid des modules */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {modules.map(module => (
          <ModuleCard key={module.id} module={module} />
        ))}
      </div>

      {/* Pagination personnalisée */}
      {pagination && pagination.totalPages > 1 && onPageChange && (
        <CustomPagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
