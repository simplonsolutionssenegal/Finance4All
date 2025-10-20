'use client';

import Image from 'next/image';
import { useEffect, useState, useMemo } from 'react';

import { useLoader } from '@/contexts/LoaderContext';
import { useGetInstitutions } from '@/hooks/institution/useGetInstitutions';
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
type ServiceRow = Service & {
  institutionName: string;
  institutionLogo?: string;
};

const ServiceListComparison = () => {
  const { showLoader, hideLoader } = useLoader();
  const [currentServicePage, setCurrentServicePage] = useState(1);
  const servicesPerPage = 12;

  const { institutions, isLoading, isError, error, refetch } = useGetInstitutions({
    page: 1,
    limit: 100,
  });

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
            Erreur lors du chargement des services finances: {error?.message}
          </p>
          <Button onClick={() => refetch()} variant='outline'>
            Réessayer
          </Button>
        </div>
      );
    }

    if (allServices.length === 0) {
      return <div className='text-center py-12 text-gray-500'>Aucun service disponible</div>;
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
            Page {currentServicePage} sur {totalPages} ({totalServices} services au total)
          </div>
        </div>
      )}

      <section className='py-16'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <h2 className='text-3xl font-bold text-center mb-12'>Les finances partenaires</h2>
          <div className='grid grid-cols-4 md:grid-cols-8 gap-6 mb-8'>
            {institutions.map(institution => (
              <div
                key={institution.id}
                className='relative w-20 h-12 rounded-md border-1 border-gray-700 bg-white'
              >
                <Image
                  src={institution.logoUrl || '/placeholder-logo.png'}
                  alt={institution.name}
                  fill
                  className='object-contain p-1' // p-1 pour un peu d'air
                  sizes='80px' // taille de rendu (w-20 = 80px)
                  priority={false}
                />
              </div>
            ))}
          </div>
          <div className='text-center'>
            <button className='border-b-2 border-gray-800 text-gray-800 font-semibold pb-1 hover:border-teal-500 hover:text-teal-500'>
              Afficher plus
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServiceListComparison;
