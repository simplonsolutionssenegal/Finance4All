'use client';

import { Search, Filter, ChevronDown, MoreVertical, Pencil, Trash2, Archive } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { type JSX, useEffect, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useGetInstitutions } from '@/hooks/institution/useGetInstitutions';
import { type Institution, InstitutionStatus } from '@/types/Institution';

import InstitutionModal from './InstitutionModal';

const InstitutionsList = () => {
  const { showLoader, hideLoader } = useLoader();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageLimit = 10;

  const { institutions, pagination, isLoading, isError, error, refetch } = useGetInstitutions({
    page: currentPage,
    limit: pageLimit,
  });

  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const f = (s?: string) => (s || '').toLowerCase().includes(q.toLowerCase());
    return institutions.filter(i => f(i.name) || f(i.website) || f(i.description));
  }, [institutions, q]);

  useEffect(() => {
    if (isLoading) showLoader();
    else hideLoader();
  }, [isLoading, showLoader, hideLoader]);

  useEffect(() => {
    const onOpen = () => {
      setSelectedInstitution(null);
      setIsModalOpen(true);
    };
    globalThis.addEventListener('open-institution-modal', onOpen);
    return () => globalThis.removeEventListener('open-institution-modal', onOpen);
  }, []);

  const handlePageChange = (page: number) => setCurrentPage(page);

  const renderPageNumbers = () => {
    if (!pagination) return null;
    const { page, totalPages } = pagination;
    const items: JSX.Element[] = [];
    const showEllipsis = totalPages > 7;

    if (showEllipsis) {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink onClick={() => handlePageChange(1)} isActive={page === 1}>
            1
          </PaginationLink>
        </PaginationItem>
      );
      if (page > 3) items.push(<PaginationEllipsis key='e-start' />);
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink onClick={() => handlePageChange(i)} isActive={page === i}>
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
      if (page < totalPages - 2) items.push(<PaginationEllipsis key='e-end' />);
      if (totalPages > 1) {
        items.push(
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
        items.push(
          <PaginationItem key={i}>
            <PaginationLink onClick={() => handlePageChange(i)} isActive={page === i}>
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }
    return items;
  };

  const renderStatus = (status: InstitutionStatus) => {
    switch (status) {
      case InstitutionStatus.ACTIVE:
        return (
          <Badge className='bg-emerald-50 text-emerald-700 border border-emerald-200'>Actif</Badge>
        );
      case InstitutionStatus.INACTIVE:
        return <Badge className='bg-rose-50 text-rose-700 border border-rose-200'>Inactif</Badge>;
      case InstitutionStatus.PENDING:
        return (
          <Badge className='bg-amber-50 text-amber-700 border border-amber-200'>En attente</Badge>
        );
      default:
        return <Badge>—</Badge>;
    }
  };

  const renderTable = () => {
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

    if (filtered.length === 0) {
      return (
        <div className='flex justify-center items-center py-16'>
          <p className='text-gray-500'>Aucune institution trouvée</p>
        </div>
      );
    }

    return (
      <>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50 sticky top-0 z-[1] shadow-sm'>
              <tr className='text-left'>
                <th className='rounded-tl-2xl py-4 px-4 text-sm font-semibold text-gray-900'>
                  Institution
                </th>
                <th className='py-4 px-4 text-sm font-semibold text-gray-900'>Type</th>
                <th className='py-4 px-4 text-sm font-semibold text-gray-900'>Pays</th>
                <th className='py-4 px-4 text-sm font-semibold text-gray-900'>Zones</th>
                <th className='py-4 px-4 text-sm font-semibold text-gray-900'>Services</th>
                <th className='py-4 px-4 text-sm font-semibold text-gray-900'>Statut</th>
                <th className='rounded-tr-2xl py-4 px-4 text-sm font-semibold text-gray-900'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {filtered.map(institution => {
                const zonesCount = institution.geographicZones?.length ?? 0;
                const services = (institution as unknown as { services?: unknown[] }).services;
                const servicesCount = Array.isArray(services) ? services.length : 0;

                return (
                  <tr key={institution.id} className='hover:bg-gray-50/60'>
                    {/* Institution */}
                    <td className='py-4 px-4'>
                      <Link
                        href={`/institutions/${institution.id}`}
                        className='flex items-center gap-3 group'
                      >
                        {!!institution.logoUrl && (
                          <Image
                            src={institution.logoUrl}
                            alt={institution.name}
                            width={32}
                            height={32}
                            className='w-8 h-8 rounded-lg object-cover border border-gray-200'
                          />
                        )}
                        <div>
                          <div className='font-semibold text-gray-900 group-hover:underline underline-offset-2'>
                            {institution.name}
                          </div>
                          <div className='text-xs text-gray-500 truncate max-w-[280px]'>
                            {institution.description || institution.website || '—'}
                          </div>
                        </div>
                      </Link>
                    </td>

                    {/* Type / Pays placeholders */}
                    <td className='py-4 px-4'>
                      <Badge className='bg-slate-100 text-slate-700'>—</Badge>
                    </td>
                    <td className='py-4 px-4 text-sm text-gray-600'>—</td>

                    {/* Zones */}
                    <td className='py-4 px-4 text-sm text-gray-700'>
                      {zonesCount} zone{zonesCount > 1 ? 's' : ''}
                    </td>

                    {/* Services */}
                    <td className='py-4 px-4'>
                      <span className='inline-flex items-center justify-center min-w-[26px] h-6 px-2 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200'>
                        {servicesCount}
                      </span>
                    </td>

                    {/* Statut */}
                    <td className='py-4 px-4'>{renderStatus(institution.status)}</td>

                    {/* Actions */}
                    <td className='py-4 px-4'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className='p-2 text-gray-600 hover:bg-gray-100 rounded-lg'
                            aria-label='Actions'
                          >
                            <MoreVertical className='w-5 h-5' />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align='end'
                          className='w-40 rounded-xl p-1 border border-gray-200 bg-white shadow-md'
                        >
                          <DropdownMenuItem
                            className='flex items-center gap-2 px-2 py-2 rounded-lg text-[13px] text-gray-700
                               focus:bg-gray-100 data-[highlighted]:bg-gray-100 cursor-pointer'
                            onClick={() => {
                              setSelectedInstitution(institution);
                              setIsModalOpen(true);
                            }}
                          >
                            <Pencil className='w-4 h-4' />
                            Modifier
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className='gap-2'
                            onClick={() => {
                              console.warn('Archiver', institution.id);
                            }}
                          >
                            <Archive className='w-4 h-4' />
                            Archiver
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            className='gap-2 text-red-600 focus:text-red-700'
                            onClick={() => {
                              console.warn('Supprimer', institution.id);
                            }}
                          >
                            <Trash2 className='w-4 h-4' />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className='border-t border-gray-100 bg-gray-50/60 px-3 py-4 rounded-b-2xl'>
            <Pagination>
              <PaginationContent>
                <PaginationPrevious
                  data-testid='pagination-previous'
                  onClick={() => {
                    console.warn('pagination previous clicked, current page=', pagination.page);
                    if (pagination.page > 1) handlePageChange(pagination.page - 1);
                  }}
                  className={
                    pagination.page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                  }
                />

                {renderPageNumbers()}

                <PaginationNext
                  data-testid='pagination-next'
                  onClick={() => {
                    console.warn('pagination next clicked, current page=', pagination.page);
                    if (pagination.page < pagination.totalPages)
                      handlePageChange(pagination.page + 1);
                  }}
                  className={
                    pagination.page === pagination.totalPages
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationContent>
            </Pagination>
            <div className='text-center mt-3 text-sm text-gray-600'>
              Page {pagination.page} sur {pagination.totalPages} ({pagination.total} institutions au
              total)
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className='space-y-6'>
      {/* === Carte 1 : Recherche + Filtres (séparée) === */}
      <section
        className='
    bg-white rounded-2xl
    p-3 md:p-3.5
    shadow-[0_10px_22px_-10px_rgba(16,24,40,.28),0_4px_10px_-6px_rgba(16,24,40,.18)]
  '
      >
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-2.5'>
          <div className='relative w-full md:max-w-2xl'>
            <Search className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4' />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              type='text'
              placeholder='Rechercher une institution…'
              className='
          w-full h-9 pl-9 pr-3
          text-sm leading-none
          rounded-lg
          bg-gray-50               
          outline-none
          border-0             
          ring-0  
          focus:ring-2 focus:ring-blue-200
          placeholder:text-gray-400
        '
            />
          </div>

          <div className='flex items-center gap-2'>
            <Button
              variant='ghost' /* évite la bordure du outline */
              className="
          h-9 px-3 text-sm rounded-lg
          bg-gray-50 hover:bg-gray-100
          shadow-none              /* pas d'ombre parasite */
        "
            >
              <Filter className='w-4 h-4 mr-1.5' />
              Tous les types
              <ChevronDown className='w-4 h-4 ml-1.5' />
            </Button>

            <Button
              variant='ghost'
              className='
          h-9 px-3 text-sm rounded-lg
          bg-gray-50 hover:bg-gray-100
          shadow-none
        '
            >
              Tous les pays
              <ChevronDown className='w-4 h-4 ml-1.5' />
            </Button>
          </div>
        </div>
      </section>

      {/* === Carte 2 : Liste / Table === */}
      <section className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'>
        {renderTable()}
      </section>

      <InstitutionModal
        open={isModalOpen}
        onOpenChange={open => {
          setIsModalOpen(open);
          if (!open) setSelectedInstitution(null);
        }}
        refresh={() => refetch()}
        institution={selectedInstitution}
      />
    </div>
  );
};

export default InstitutionsList;
