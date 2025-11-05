// frontend/src/components/ui/custom-pagination.tsx (version compacte)

'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface CustomPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function CustomPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: CustomPaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const renderPageButtons = () => {
    const buttons = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Afficher toutes les pages
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => onPageChange(i)}
            className={`min-w-[36px] h-[36px] rounded-lg text-sm font-medium transition-all ${
              i === currentPage
                ? 'bg-sky-400 text-white shadow-md'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {i}
          </button>
        );
      }
    } else {
      // Logique pour afficher avec ellipsis
      buttons.push(
        <button
          key={1}
          onClick={() => onPageChange(1)}
          className={`min-w-[36px] h-[36px] rounded-lg text-sm font-medium transition-all ${
            1 === currentPage
              ? 'bg-sky-400 text-white shadow-md'
              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          1
        </button>
      );

      if (currentPage > 3) {
        buttons.push(
          <span key='ellipsis-start' className='px-1 text-gray-400'>
            ...
          </span>
        );
      }

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => onPageChange(i)}
            className={`min-w-[36px] h-[36px] rounded-lg text-sm font-medium transition-all ${
              i === currentPage
                ? 'bg-sky-400 text-white shadow-md'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {i}
          </button>
        );
      }

      if (currentPage < totalPages - 2) {
        buttons.push(
          <span key='ellipsis-end' className='px-1 text-gray-400'>
            ...
          </span>
        );
      }

      buttons.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className={`min-w-[36px] h-[36px] rounded-lg text-sm font-medium transition-all ${
            totalPages === currentPage
              ? 'bg-sky-400 text-white shadow-md'
              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className='flex items-center justify-between py-3 px-2 bg-white rounded-lg border border-gray-200'>
      {/* Info */}
      <div className='text-xs text-gray-600'>
        Affichage de <span className='font-semibold'>{startItem}</span> à{' '}
        <span className='font-semibold'>{endItem}</span> sur{' '}
        <span className='font-semibold'>{totalItems}</span> résultats
      </div>

      {/* Contrôles */}
      <div className='flex items-center gap-1'>
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className='p-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
        >
          <ChevronsLeft size={16} />
        </button>

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className='p-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
        >
          <ChevronLeft size={16} />
        </button>

        <div className='flex items-center gap-1 mx-1'>{renderPageButtons()}</div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className='p-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
        >
          <ChevronRight size={16} />
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className='p-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
}
