'use client';

import { ArrowLeft, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import ConfirmUpdateStatusModal from '@/components/admin/institutions/ConfirmUpdateStatusModal';
import SearchBar from '@/components/admin/institutions/SearchBar';
import ServiceItem from '@/components/admin/institutions/ServiceItem';
import ServiceModal from '@/components/admin/institutions/ServiceModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useLoader } from '@/contexts/LoaderContext';
import { useGetInstitution } from '@/hooks/institution/useGetInstitution';
import { InstitutionStatus } from '@/types/Institution';
import { type FilterOptions, EMPTY_FILTERS } from '@/types/Service';

interface InstitutionDetailsComponentProps {
  institutionId: string;
}

const InstitutionDetailsComponent = ({ institutionId }: InstitutionDetailsComponentProps) => {
  const { showLoader, hideLoader } = useLoader();
  const { institution, isLoading, isError, error, refetch } = useGetInstitution(institutionId);
  const [showUpdateStateModal, setShowUpdateStateModal] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<InstitutionStatus>(InstitutionStatus.PENDING);
  const [showServiceModal, setShowServiceModal] = useState<boolean>(false);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filters, setFilters] = useState<FilterOptions>(EMPTY_FILTERS);

  useEffect(() => {
    if (isLoading) {
      showLoader();
    } else {
      hideLoader();
    }
  }, [isLoading, showLoader, hideLoader]);

  // Filter services based on search and filters
  const filteredServices = useMemo(() => {
    if (!institution?.services) return [];

    let filtered = [...institution.services];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        service =>
          service.name.toLowerCase().includes(searchLower) ||
          service.longName.toLowerCase().includes(searchLower) ||
          service.type.toLowerCase().includes(searchLower)
      );
    }

    if (filters.type && filters.type.length > 0) {
      filtered = filtered.filter(service => filters.type.includes(service.type));
    }

    // if (filters.date) {
    //   const now = new Date();
    //   filtered = filtered.filter(service => {
    //     const serviceDate = new Date(service.createdAt);
    //     const diffTime = Math.abs(now.getTime() - serviceDate.getTime());
    //     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    //     if (filters.date === 'recent') {
    //       return diffDays <= 7;
    //     } else if (filters.date === '3mois') {
    //       return diffDays <= 90;
    //     }
    //     return true;
    //   });
    // }

    return filtered;
  }, [institution?.services, searchTerm, filters]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const renderStatus = (status: InstitutionStatus) => {
    switch (status) {
      case InstitutionStatus.ACTIVE:
        return (
          <Badge className='bg-green-300/30 py-1 rounded-xl flex items-center gap-2'>
            <div className='h-4 w-4 rounded-full bg-green-500/80' />
            Actif
          </Badge>
        );
      case InstitutionStatus.INACTIVE:
        return (
          <Badge className='bg-red-300/30 py-1 rounded-xl flex items-center gap-2'>
            <div className='h-4 w-4 rounded-full bg-red-500/80' />
            Inactif
          </Badge>
        );
      case InstitutionStatus.PENDING:
        return (
          <Badge className='bg-orange-300/30 py-1 rounded-xl flex items-center gap-2'>
            <div className='h-4 w-4 rounded-full bg-orange-500/80' />
            En attente
          </Badge>
        );
      default:
        return null;
    }
  };

  const activationButton = () => (
    <Button
      onClick={() => {
        setNewStatus(InstitutionStatus.ACTIVE);
        setShowUpdateStateModal(true);
      }}
      className='bg-green-500 text-white font-bold text-sm hover:bg-green-600'
    >
      ACTIVER
    </Button>
  );

  const desactivationButton = () => (
    <Button
      onClick={() => {
        setNewStatus(InstitutionStatus.INACTIVE);
        setShowUpdateStateModal(true);
      }}
      className='bg-red-500 text-white font-bold text-sm hover:bg-red-600'
    >
      REJETER
    </Button>
  );

  if (isError) {
    return (
      <div className='px-10 py-20'>
        <div className='flex flex-col items-center justify-center gap-4'>
          <p className='text-red-500 text-center text-lg'>
            Erreur lors du chargement de l&apos;institution: {error?.message}
          </p>
          <Link href='/institutions'>
            <Button variant='outline'>Retour à la liste</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!institution) {
    return null;
  }

  return (
    <div className='px-10 py-6'>
      <div className='mb-6'>
        <Link
          href='/institutions'
          className='flex items-center gap-2 text-gray-600 hover:text-gray-900'
        >
          <ArrowLeft className='w-5 h-5' />
          <span>Retour à la liste</span>
        </Link>
      </div>

      <div className='flex gap-6'>
        <div className='p-2 border-2 border-gray-200 rounded-2xl h-32 w-32 overflow-hidden flex items-center justify-center bg-gray-50'>
          {institution.logoUrl ? (
            <Image
              src={institution.logoUrl}
              alt={`Logo de ${institution.name}`}
              width={500}
              height={500}
            />
          ) : (
            <div className='text-gray-400 text-4xl font-bold'>
              {institution.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className='flex-col flex-1 space-y-2'>
          <div className='flex flex-1 justify-between'>
            <div className='flex'>
              <Label className='text-3xl font-bold text-black'>{institution.name}</Label>
            </div>
            <div className='flex gap-4'>
              {institution.status === InstitutionStatus.PENDING && (
                <>
                  {desactivationButton()}
                  {activationButton()}
                </>
              )}
              {institution.status === InstitutionStatus.ACTIVE && <>{desactivationButton()}</>}
              {institution.status === InstitutionStatus.INACTIVE && <>{activationButton()}</>}
            </div>
          </div>
          <div className='flex flex-1 gap-4 items-center'>
            {renderStatus(institution.status)}
            <Badge className='bg-[#6CB9C642] p-2 rounded-xl'>
              <Link href={institution.website}>{institution.website}</Link>
            </Badge>
          </div>
          <div className='flex flex-1 flex-col gap-2'>
            <Label className='font-semibold'>Description :</Label>
            <p className='text-gray-700'>{institution.description}</p>
          </div>
          <div className='flex flex-1 flex-col gap-2'>
            <Label className='font-semibold'>Zones géographiques :</Label>
            <div className='flex gap-2 flex-wrap'>
              {institution.geographicZones.map(zone => (
                <Badge key={zone} className='bg-blue-300/40 p-2 rounded-xl'>
                  {zone}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Separator className='border border-gray-300 my-10' />

      <div>
        <div className='flex justify-between items-end   mb-6'>
          <SearchBar
            onSearch={handleSearch}
            resultsCount={filteredServices.length}
            onApplyFilters={handleApplyFilters}
            currentFilters={filters}
          />
          <Button
            onClick={() => setShowServiceModal(true)}
            className='bg-cyan-400 text-white hover:bg-cyan-500 flex items-center gap-2 ml-auto'
          >
            <Plus className='w-4 h-4' />
            Ajouter un service
          </Button>
        </div>

        {institution.services && institution.services.length > 0 ? (
          filteredServices.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {filteredServices.map(service => (
                <ServiceItem key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <div className='text-center py-8'>
              <p className='text-gray-500 mb-2'>Aucun service ne correspond à votre recherche.</p>
              <Button
                variant='outline'
                onClick={() => {
                  setSearchTerm('');
                  setFilters(EMPTY_FILTERS);
                }}
                className='text-cyan-600 hover:text-cyan-700'
              >
                Effacer les filtres
              </Button>
            </div>
          )
        ) : (
          <p className='text-gray-500 text-center py-8'>Aucun service financier pour le moment.</p>
        )}
      </div>

      <ConfirmUpdateStatusModal
        isOpen={showUpdateStateModal}
        onClose={() => setShowUpdateStateModal(false)}
        refresh={() => refetch()}
        institution={institution}
        status={newStatus}
      />

      <ServiceModal
        open={showServiceModal}
        onOpenChange={setShowServiceModal}
        institutionId={institutionId}
        refresh={() => refetch()}
      />
    </div>
  );
};

export default InstitutionDetailsComponent;
