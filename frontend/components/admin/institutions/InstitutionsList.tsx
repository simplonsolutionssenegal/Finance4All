'use client';

import { Search, Filter, Edit, Trash2, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { useLoader } from '@/contexts/LoaderContext';
import { InstitutionStatus, useGetInstitutions } from '@/hooks/useGetInstitutions';

import AddInstitutionModal from './AddInstitutionModal';

const InstitutionsList = () => {
  const { showLoader, hideLoader } = useLoader();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageLimit = 10;

  const { institutions, pagination, isLoading, isError, error, refetch } = useGetInstitutions({
    page: currentPage,
    limit: pageLimit,
  });

  useEffect(() => {
    if (isLoading) {
      showLoader();
    } else {
      hideLoader();
    }
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPageNumbers = () => {
    if (!pagination) return null;

    const { page, totalPages } = pagination;
    const pageNumbers = [];
    const showEllipsis = totalPages > 7;

    if (showEllipsis) {
      pageNumbers.push(
        <PaginationItem key={1}>
          <PaginationLink onClick={() => handlePageChange(1)} isActive={page === 1}>
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (page > 3) {
        pageNumbers.push(<PaginationEllipsis key='ellipsis-start' />);
      }

      const startPage = Math.max(2, page - 1);
      const endPage = Math.min(totalPages - 1, page + 1);

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(
          <PaginationItem key={i}>
            <PaginationLink onClick={() => handlePageChange(i)} isActive={page === i}>
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (page < totalPages - 2) {
        pageNumbers.push(<PaginationEllipsis key='ellipsis-end' />);
      }

      if (totalPages > 1) {
        pageNumbers.push(
          <PaginationItem key={totalPages}>
            <PaginationLink
              onClick={() => handlePageChange(totalPages)}
              isActive={page === totalPages}
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(
          <PaginationItem key={i}>
            <PaginationLink onClick={() => handlePageChange(i)} isActive={page === i}>
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }

    return pageNumbers;
  };

  const renderStatut = (status: InstitutionStatus) => {
    switch (status) {
      case InstitutionStatus.ACTIVE:
        return <Badge className='text-sm text-green-600 font-medium'>Actif</Badge>;
      case InstitutionStatus.INACTIVE:
        return <Badge className='text-sm text-red-600 font-medium'>Inactif</Badge>;
      case InstitutionStatus.PENDING:
        return <Badge className='text-sm text-orange-600 font-medium'>En attente</Badge>;
      default:
        return <Badge> </Badge>;
    }
  };

  const renderInstitutionTable = () => {
    if (isError) {
      return (
        <div className='flex flex-col justify-center items-center py-12 gap-4'>
          <p className='text-red-500 text-center'>
            Erreur lors du chargement des institutions: {error?.message}
          </p>
          <Button onClick={() => refetch()} variant='outline'>
            Réessayer
          </Button>
        </div>
      );
    }

    if (institutions.length === 0) {
      return (
        <div className='flex justify-center items-center py-12'>
          <p className='text-gray-500'>Aucune institution trouvée</p>
        </div>
      );
    }

    return (
      <>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-300/30'>
              <tr className=''>
                <th className='rounded-ss-2xl text-left py-4 px-4 text-sm font-semibold text-gray-900'>
                  Nom de l&apos;institut
                </th>
                <th className='text-left py-4 px-4 text-sm font-semibold text-gray-900'>
                  Site web
                </th>
                <th className='text-left py-4 px-4 text-sm font-semibold text-gray-900'>
                  Description
                </th>
                <th className='text-left py-4 px-4 text-sm font-semibold text-gray-900'>Statut</th>
                <th className='rounded-se-2xl text-left py-4 px-4 text-sm font-semibold text-gray-900'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {institutions.map(institution => (
                <tr key={institution.id} className='hover:bg-gray-50'>
                  <td className='py-4 px-4 text-sm text-gray-900'>{institution.name}</td>
                  <td className='py-4 px-4 text-sm text-gray-600'>{institution.website}</td>
                  <td className='py-4 px-4 text-sm text-gray-600'>{institution.description}</td>
                  <td className='py-4 px-4'>{renderStatut(institution.status)}</td>
                  <td className='py-4 px-4'>
                    <div className='flex items-center gap-2'>
                      <button className='p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors'>
                        <Edit className='w-5 h-5' />
                      </button>
                      <button className='p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors'>
                        <Trash2 className='w-5 h-5' />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className='mt-6'>
            <Pagination>
              <PaginationContent>
                <PaginationPrevious
                  onClick={() => pagination.page > 1 && handlePageChange(pagination.page - 1)}
                  className={
                    pagination.page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                  }
                />
                {renderPageNumbers()}
                <PaginationNext
                  onClick={() =>
                    pagination.page < pagination.totalPages && handlePageChange(pagination.page + 1)
                  }
                  className={
                    pagination.page === pagination.totalPages
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationContent>
            </Pagination>
            <div className='text-center mt-4 text-sm text-gray-600'>
              Page {pagination.page} sur {pagination.totalPages} ({pagination.total} institutions au
              total)
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
      <h2 className='text-xl font-bold text-gray-900 mb-6'>Liste des instituts</h2>

      <div className='flex justify-between items-center gap-4 mb-6'>
        <div className='flex items-center gap-4'>
          <div className='relative'>
            <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
            <input
              type='text'
              placeholder='Rechercher une institut'
              className='w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
          <button className='flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors'>
            <Filter className='w-5 h-5' />
            Filter
          </button>
        </div>

        <div className='flex justify-end gap-4'>
          <Button
            variant={'default'}
            onClick={() => setIsModalOpen(true)}
            className='flex items-center bg-teal-500 text-white font-bold gap-2 px-6 py-3 rounded-xl transition-colors'
          >
            <Plus className='w-5 h-5' color='white' />
            Ajouter une institution
          </Button>
        </div>
      </div>

      {renderInstitutionTable()}

      <AddInstitutionModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        refresh={() => refetch()}
      />
    </div>
  );
};

export default InstitutionsList;
