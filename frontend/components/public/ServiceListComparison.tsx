'use client';

import Image from 'next/image';
import { useEffect, useState, useMemo } from 'react';

import { useLoader } from '@/contexts/LoaderContext';
import { useGetInstitutions } from '@/hooks/institution/useGetInstitutions';
import { useGetInstitutionsByServiceType } from '@/hooks/institution/useGetInstitutionsByServiceType';
import type { Frais, Service } from '@/types/Service';

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

import PartenaireInstitutions from './PartenaireInstitutions';

type ServiceRow = Service & {
  institutionName: string;
  institutionLogo?: string;
};

const SERVICE_TYPES = [
  // { value: 'ALL', label: 'Tous les services' },
  { value: 'PAIEMENT_MARCHAND', label: 'Paiement marchand' },
  { value: 'ACHAT_CREDIT', label: 'Achat de crédit' },
  { value: 'PAIEMENT_FACTURES', label: 'Paiement de factures' },
  { value: 'DEPOT_SIMPLE', label: 'Dépôts simples' },
  { value: 'DEPOT_RETRAIT_SIMPLE', label: 'Dépôts et retraits simples' },
  { value: 'RETRAIT_SIMPLE', label: 'Retraits simples' },
  { value: 'TRANSFERT_ARGENT', label: "Transferts d'argent" },
  { value: 'BANQUE_WALLET', label: 'Banque vers wallet' },
  { value: 'WALLET_BANQUE', label: 'Wallet vers banque' },
  { value: 'EPARGNE', label: 'Épargne' },
  { value: 'CREDIT', label: 'Crédit' },
  { value: 'ASSURANCE', label: 'Assurance' },
  { value: 'AUTRES', label: 'Autres services' },
];

const ServiceListComparison = () => {
  const { showLoader, hideLoader } = useLoader();
  const [currentServicePage, setCurrentServicePage] = useState(1);
  const [selectedType, setSelectedType] = useState('');
  const servicesPerPage = 12;

  // Requête pour tous les services
  const {
    institutions: allInstitutions,
    isLoading: isLoadingAll,
    isError: isErrorAll,
    error: errorAll,
    refetch: refetchAll,
  } = useGetInstitutions({
    page: 1,
    limit: 100,
  });

  // Requête pour les services filtrés
  const {
    institutions: filteredInstitutions,
    isLoading: isLoadingFiltered,
    isError: isErrorFiltered,
    error: errorFiltered,
    refetch: refetchFiltered,
  } = useGetInstitutionsByServiceType({
    type: selectedType === 'ALL' ? '' : selectedType,
    page: 1,
    limit: 100,
  });

  // Déterminer quelles données utiliser
  const institutions = selectedType === '' ? allInstitutions : filteredInstitutions;
  const isLoading = selectedType === '' ? isLoadingAll : isLoadingFiltered;
  const isError = selectedType === '' ? isErrorAll : isErrorFiltered;
  const error = selectedType === '' ? errorAll : errorFiltered;
  const refetch = selectedType === '' ? refetchAll : refetchFiltered;

  useEffect(() => {
    if (isLoading) {
      showLoader();
    } else {
      hideLoader();
    }
  }, [isLoading, showLoader, hideLoader]);

  const allServices = useMemo<ServiceRow[]>(() => {
    const out: ServiceRow[] = [];
    for (const institution of institutions ?? []) {
      for (const service of institution.services ?? []) {
        out.push({
          ...service,
          institutionName: institution.name,
          institutionLogo: institution.logoUrl,
        });
      }
    }
    return out;
  }, [institutions]);

  const totalServices = allServices.length;
  const totalPages = Math.ceil(totalServices / servicesPerPage);
  const startIndex = (currentServicePage - 1) * servicesPerPage;
  const endIndex = startIndex + servicesPerPage;
  const currentServices = allServices.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentServicePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    setCurrentServicePage(1); // Réinitialiser à la page 1
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    })
      .format(montant)
      .replace('XOF', 'FCFA');
  };

  const renderFrais = (frais: Frais) => {
    if (!frais || Object.keys(frais).length === 0) {
      return <span className='text-green-600 font-medium'>Gratuit</span>;
    }

    const parts = [];
    if (frais.montantFixe) {
      parts.push(`${formatMontant(frais.montantFixe)} fixe`);
    }
    if (frais.pourcentage) {
      parts.push(`${frais.pourcentage}%`);
    }
    if (frais.minimum) {
      parts.push(`Min: ${formatMontant(frais.minimum)}`);
    }
    if (frais.maximum) {
      parts.push(`Max: ${formatMontant(frais.maximum)}`);
    }

    return <span className='text-gray-700'>{parts.join(' + ')}</span>;
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const showEllipsis = totalPages > 7;

    if (showEllipsis) {
      pageNumbers.push(
        <PaginationItem key={1}>
          <PaginationLink onClick={() => handlePageChange(1)} isActive={currentServicePage === 1}>
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (currentServicePage > 3) pageNumbers.push(<PaginationEllipsis key='ellipsis-start' />);

      const startPage = Math.max(2, currentServicePage - 1);
      const endPage = Math.min(totalPages - 1, currentServicePage + 1);
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(
          <PaginationItem key={i}>
            <PaginationLink onClick={() => handlePageChange(i)} isActive={currentServicePage === i}>
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (currentServicePage < totalPages - 2)
        pageNumbers.push(<PaginationEllipsis key='ellipsis-end' />);

      if (totalPages > 1) {
        pageNumbers.push(
          <PaginationItem key={totalPages}>
            <PaginationLink
              onClick={() => handlePageChange(totalPages)}
              isActive={currentServicePage === totalPages}
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
            <PaginationLink onClick={() => handlePageChange(i)} isActive={currentServicePage === i}>
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }

    return pageNumbers;
  };

  const renderServicesList = () => {
    if (isError) {
      return (
        <div className='flex flex-col justify-center items-center py-12 gap-4'>
          <p className='text-red-500 text-center'>
            Erreur lors du chargement des services: {error?.message}
          </p>
          <Button onClick={() => refetch()} variant='outline'>
            Réessayer
          </Button>
        </div>
      );
    }

    if (allServices.length === 0) {
      return (
        <div className='text-center py-12 text-gray-500'>
          {selectedType === 'ALL'
            ? 'Aucun service disponible'
            : `Aucun service de type "${SERVICE_TYPES.find(t => t.value === selectedType)?.label}" disponible`}
        </div>
      );
    }

    return (
      <div className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2'>
          {currentServices.map(service => (
            <Card key={service.id} className='hover:shadow-lg transition-shadow'>
              <CardHeader>
                <div className='flex items-start justify-between gap-2'>
                  <div className='flex-1'>
                    <CardTitle className='text-lg mb-2'>{service.name}</CardTitle>
                    <p className='text-sm text-gray-600'>{service.longName}</p>
                  </div>
                  {service.institutionLogo && (
                    <Image
                      src={service.institutionLogo}
                      alt={service.institutionName}
                      width={50}
                      height={50}
                      className='rounded-md'
                    />
                  )}
                </div>
              </CardHeader>

              <CardContent className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <p className='text-sm font-semibold text-gray-700 mb-1'>Type:</p>
                  <Badge variant='outline' className='bg-teal-500'>
                    {service.type}
                  </Badge>
                </div>

                <div>
                  <p className='text-sm font-semibold text-gray-700 mb-1'>Frais:</p>
                  {renderFrais(service.frais)}
                </div>

                {service.plafonds && service.plafonds.length > 0 && (
                  <div>
                    <p className='text-sm font-semibold text-gray-700 mb-1'>Plafond:</p>
                    <p className='text-sm text-gray-600'>
                      {formatMontant(parseInt(service.plafonds[0]))}
                    </p>
                  </div>
                )}

                {service.infrastructureAccess && service.infrastructureAccess.length > 0 && (
                  <div>
                    <p className='text-sm font-semibold text-gray-700 mb-1'>Accès:</p>
                    <div className='flex flex-wrap gap-1'>
                      {service.infrastructureAccess.map((infrastructure: string) => (
                        <Badge key={infrastructure} variant='outline' className='text-xs'>
                          {infrastructure}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {service.conditionAccess && service.conditionAccess.length > 0 && (
                  <div>
                    <p className='text-sm font-semibold text-gray-700 mb-1'>Conditions:</p>
                    <ul className='text-xs text-gray-600 space-y-1'>
                      {service.conditionAccess.map((condition: string) => (
                        <li key={condition} className='flex items-start'>
                          <span className='mr-1'>•</span>
                          <span>{condition}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
      <h2 className='text-3xl font-bold text-center mb-8'>Comparaison des Services Financiers</h2>

      {/* Filtre par type de service */}
      <div className='mb-6 flex justify-between items-center'>
        <div className='flex flex-col items-start gap-1'>
          <label className='text-sm font-medium text-gray-700'>Filtrer par type:</label>
          <Select value={selectedType} onValueChange={handleTypeChange}>
            <SelectTrigger className='w-[280px]'>
              <SelectValue placeholder='Sélectionner un type' />
            </SelectTrigger>
            <SelectContent className='bg-teal-500'>
              {SERVICE_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='text-sm text-gray-600'>
          {totalServices} service{totalServices > 1 ? 's' : ''} trouvé{totalServices > 1 ? 's' : ''}
        </div>
      </div>

      {renderServicesList()}

      {totalPages > 1 && (
        <div className='mt-6'>
          <Pagination>
            <PaginationContent>
              <PaginationPrevious
                onClick={() => currentServicePage > 1 && handlePageChange(currentServicePage - 1)}
                className={
                  currentServicePage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                }
              />
              {renderPageNumbers()}
              <PaginationNext
                onClick={() =>
                  currentServicePage < totalPages && handlePageChange(currentServicePage + 1)
                }
                className={
                  currentServicePage === totalPages
                    ? 'pointer-events-none opacity-50'
                    : 'cursor-pointer'
                }
              />
            </PaginationContent>
          </Pagination>
          <div className='text-center mt-4 text-sm text-gray-600'>
            Page {currentServicePage} sur {totalPages}
          </div>
        </div>
      )}

      <PartenaireInstitutions
        institutions={institutions}
        title='Les finances partenaires'
        initialDisplayCount={8}
        incrementCount={8}
      />
    </div>
  );
};

export default ServiceListComparison;
