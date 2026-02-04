'use client';

import {
  Search,
  Filter,
  ChevronDown,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import InstitutionModal from './InstitutionModal';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLoader } from '@/contexts/LoaderContext';
import { useGetInstitutions } from '@/hooks/institution/useGetInstitutions';
import { type Institution, InstitutionStatus } from '@/types/Institution';

const TYPE_LABELS: Record<string, string> = {
  ETABLISSEMENT_MONNAIE_ELECTRONIQUE: 'Établissement de monnaie électronique',
  PORTEFEUILLE_NUMERIQUE: 'Portefeuille numérique',
  SERVICE_PAIEMENT_ELECTRONIQUE: 'Service de paiement',
  BANQUE_NUMERIQUE: 'Banque numérique',
  SERVICE_FINANCIER_DECENTRALISE: 'SFD',
  SERVICE_FINANCEMENT_PARTICIPATIF: 'Financement participatif',
  SERVICE_INVESTISSEMENT: 'Investissement',
  SERVICE_GESTION_FINANCIERE: 'Gestion financière',
  SERVICE_ASSURANCE_NUMERIQUE: 'Assurance numérique',
};

const COUNTRY_LABELS: Record<string, string> = {
  SENEGAL: 'Sénégal',
  CAMEROUN: 'Cameroun',
};

const COUNTRY_FLAGS: Record<string, string> = {
  SENEGAL: '🇸🇳',
  CAMEROUN: '🇨🇲',
};

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
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');

  const filtered = useMemo(() => {
    const f = (s?: string) => (s || '').toLowerCase().includes(q.toLowerCase());
    return institutions.filter(i => {
      const matchesSearch = f(i.name) || f(i.website) || f(i.description);
      const matchesType = !selectedType || i.type === selectedType;
      const matchesCountry = !selectedCountry || i.pays === selectedCountry;
      return matchesSearch && matchesType && matchesCountry;
    });
  }, [institutions, q, selectedType, selectedCountry]);

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

  const renderStatus = (status: InstitutionStatus) => {
    switch (status) {
      case InstitutionStatus.ACTIVE:
        return (
          <Badge className='bg-emerald-50 text-emerald-600 border border-emerald-200 font-medium whitespace-nowrap'>
            Actif
          </Badge>
        );
      case InstitutionStatus.INACTIVE:
        return (
          <Badge className='bg-rose-50 text-rose-600 border border-rose-200 font-medium whitespace-nowrap'>
            Inactif
          </Badge>
        );
      case InstitutionStatus.PENDING:
        return (
          <Badge className='bg-amber-50 text-amber-600 border border-amber-200 font-medium whitespace-nowrap'>
            En attente
          </Badge>
        );
      default:
        return <Badge>—</Badge>;
    }
  };

  const uniqueTypes = Array.from(new Set(institutions.map(i => i.type).filter(Boolean)));
  const uniqueCountries = Array.from(new Set(institutions.map(i => i.pays).filter(Boolean)));

  const renderPageButtons = () => {
    if (!pagination) return null;

    const buttons = [];
    const { page: currentPage, totalPages } = pagination;

    const renderButton = (pageNum: number) => (
      <button
        key={pageNum}
        onClick={() => handlePageChange(pageNum)}
        className={`min-w-[32px] h-[32px] rounded-[10px] text-sm font-medium transition-all ${
          pageNum === currentPage
            ? 'bg-[var(--primary-300)] text-white'
            : 'border border-gray-200 text-tertiary-400 hover:bg-gray-50'
        }`}
      >
        {pageNum}
      </button>
    );

    const renderEllipsis = (key: string) => (
      <span key={key} className='px-1 text-tertiary-400/60'>
        ...
      </span>
    );

    // Première page
    buttons.push(renderButton(1));

    if (currentPage > 3) {
      buttons.push(renderEllipsis('start'));
    }

    // Pages du milieu
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      if (i !== 1 && i !== totalPages) {
        buttons.push(renderButton(i));
      }
    }

    if (currentPage < totalPages - 2) {
      buttons.push(renderEllipsis('end'));
    }

    // Dernière page
    if (totalPages > 1) {
      buttons.push(renderButton(totalPages));
    }

    return buttons;
  };

  const renderTable = () => {
    if (isError) {
      return (
        <div className='flex flex-col justify-center items-center py-12 gap-4'>
          <p className='text-destructive text-center text-sm'>
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
          <p className='text-muted-foreground text-sm'>Aucune institution trouvée</p>
        </div>
      );
    }

    const startItem = pagination ? (pagination.page - 1) * pageLimit + 1 : 0;
    const endItem = pagination ? Math.min(pagination.page * pageLimit, pagination.total) : 0;

    return (
      <>
        <div className='w-full'>
          <table className='w-full table-fixed'>
            <colgroup>
              <col className='w-[35%]' />
              <col className='w-[18%]' />
              <col className='w-[15%]' />
              <col className='w-[15%]' />
              <col className='w-[17%]' />
            </colgroup>
            <thead className='bg-white border-b border-gray-200 '>
              <tr className='text-left'>
                <th className='py-4 px-6 text-sm font-semibold text-[hsl(var(--foreground))] tracking-wide'>
                  Institution
                </th>
                <th className='py-4 px-6 text-sm font-semibold text-[hsl(var(--foreground))] tracking-wide'>
                  Type
                </th>
                <th className='py-4 px-6 text-sm font-semibold text-[hsl(var(--foreground))] tracking-wide'>
                  Pays
                </th>
                <th className='py-4 px-6 text-sm font-semibold text-[hsl(var(--foreground))] tracking-wide'>
                  Zones
                </th>
                <th className='py-4 px-6 text-sm font-semibold text-[hsl(var(--foreground))] tracking-wide'>
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-100'>
              {filtered.map(institution => {
                const zonesCount = institution.geographicZones?.length ?? 0;

                return (
                  <tr key={institution.id} className='hover:bg-gray-50/40 transition-colors'>
                    {/* Institution */}
                    <td className='py-4 px-6'>
                      <Link
                        href={`/institutions/${institution.id}`}
                        className='flex items-center gap-3 group min-w-0'
                      >
                        {!!institution.logoUrl && (
                          <div className='flex-shrink-0'>
                            <Image
                              src={institution.logoUrl}
                              alt={institution.name}
                              width={44}
                              height={44}
                              className='w-11 h-11 rounded-xl object-cover'
                            />
                          </div>
                        )}
                        <div className='min-w-0 flex-1'>
                          <div className='text-base font-medium text-secondary-400 leading-tight group-hover:text-primary-300 transition-colors truncate'>
                            {institution.name}
                          </div>
                          <div className='text-sm text-tertiary-200 text-muted-foreground mt-0.5 leading-tight truncate'>
                            {institution.description || institution.website || '—'}
                          </div>
                        </div>
                      </Link>
                    </td>

                    {/* Type */}
                    <td className='py-4 px-6'>
                      {institution.type ? (
                        <Badge className='bg-white text-tertiary-400 border border-gray-200 font-medium text-sm whitespace-normal break-words'>
                          {TYPE_LABELS[institution.type] ?? institution.type}
                        </Badge>
                      ) : (
                        <span className='text-muted-foreground text-sm'>—</span>
                      )}
                    </td>

                    {/* Pays */}
                    <td className='py-4 px-6'>
                      {institution.pays ? (
                        <span className='inline-flex items-center gap-1.5 text-sm text-tertiary-400 whitespace-nowrap'>
                          <span aria-hidden className='text-base'>
                            {COUNTRY_FLAGS[institution.pays] ?? '🌍'}
                          </span>
                          <span className='font-medium'>
                            {COUNTRY_LABELS[institution.pays] ?? institution.pays}
                          </span>
                        </span>
                      ) : (
                        <span className='text-muted-foreground text-sm'>—</span>
                      )}
                    </td>

                    {/* Zones */}
                    <td className='py-4 px-6'>
                      <div className='inline-flex items-center gap-1.5 text-tertiary-400 whitespace-nowrap'>
                        <MapPin className='w-4 h-4 flex-shrink-0' />
                        <span className='text-sm font-medium'>
                          {zonesCount} zone{zonesCount > 1 ? 's' : ''}
                        </span>
                      </div>
                    </td>

                    {/* Statut */}
                    <td className='py-4 px-6'>{renderStatus(institution.status)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className='flex items-center justify-between h-[56px] px-6 bg-white border-t border-gray-200'>
            {/* Info */}
            <div className='text-[14px] text-tertiary-400/60 leading-[20px]'>
              Affichage de <span className='text-secondary-300'>{startItem}</span> à{' '}
              <span className='text-secondary-300'>{endItem}</span> sur{' '}
              <span className='text-secondary-300'>{pagination.total}</span> résultats
            </div>

            {/* Contrôles */}
            <div className='flex items-center gap-1'>
              <button
                onClick={() => handlePageChange(1)}
                disabled={pagination.page === 1}
                className='p-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
              >
                <ChevronsLeft size={16} />
              </button>

              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className='p-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
              >
                <ChevronLeft size={16} />
              </button>

              <div className='flex items-center gap-1 mx-1'>{renderPageButtons()}</div>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className='p-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
              >
                <ChevronRight size={16} />
              </button>

              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={pagination.page === pagination.totalPages}
                className='p-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className='space-y-5'>
      {/* Barre de recherche et filtres */}
      <section className='bg-white rounded-2xl px-5 h-[84px] flex items-center shadow-[0_5px_8px_rgba(0,0,0,0.1)]'>
        <div className='flex flex-col lg:flex-row lg:items-center gap-3 w-full'>
          {/* Champ de recherche */}
          <div className='relative flex-1'>
            <Search className='pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-[18px] h-[18px]' />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              type='text'
              placeholder='Rechercher une institution...'
              className='w-full h-9 pl-11 pr-4 text-sm rounded-xl bg-gray-50 border-0 outline-none focus:ring-0 focus:bg-white transition-colors placeholder:text-muted-foreground'
            />
          </div>

          {/* Filtres */}
          <div className='flex items-center gap-2.5 flex-shrink-0'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='h-9 px-4 text-sm font-normal rounded-xl bg-white hover:bg-gray-50 text-tertiary-400 transition-colors whitespace-nowrap border border-gray-200 shadow-none'
                >
                  <Filter className='w-[18px] h-[18px] mr-2' />
                  {selectedType
                    ? (TYPE_LABELS[selectedType]?.substring(0, 20) ?? selectedType)
                    : 'Tous les types'}
                  <ChevronDown className='w-[18px] h-[18px] ml-2' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                className='w-64 bg-white border border-gray-200 shadow-lg'
              >
                <DropdownMenuItem
                  onClick={() => setSelectedType('')}
                  className='cursor-pointer hover:bg-primary-300 hover:text-white focus:bg-primary-300 focus:text-white'
                >
                  Tous les types
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {uniqueTypes.map(type => (
                  <DropdownMenuItem
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className='cursor-pointer hover:bg-primary-300 hover:text-white focus:bg-primary-300 focus:text-white'
                  >
                    {TYPE_LABELS[type] ?? type}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='h-9 px-4 text-sm font-normal rounded-xl bg-white hover:bg-gray-50 text-tertiary-400 transition-colors whitespace-nowrap border border-gray-200 shadow-none'
                >
                  {selectedCountry
                    ? `${COUNTRY_FLAGS[selectedCountry]} ${COUNTRY_LABELS[selectedCountry] ?? selectedCountry}`
                    : 'Tous les pays'}
                  <ChevronDown className='w-[18px] h-[18px] ml-2' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                className='w-48 bg-white border border-gray-200 shadow-lg'
              >
                <DropdownMenuItem
                  onClick={() => setSelectedCountry('')}
                  className='cursor-pointer hover:bg-primary-300 hover:text-white focus:bg-primary-300 focus:text-white'
                >
                  Tous les pays
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {uniqueCountries.map(country => (
                  <DropdownMenuItem
                    key={country}
                    onClick={() => setSelectedCountry(country)}
                    className='cursor-pointer hover:bg-primary-300 hover:text-white focus:bg-primary-300 focus:text-white'
                  >
                    {COUNTRY_FLAGS[country]} {COUNTRY_LABELS[country] ?? country}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className='bg-white rounded-2xl shadow-[0_5px_8px_rgba(0,0,0,0.1)] overflow-hidden'>
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
