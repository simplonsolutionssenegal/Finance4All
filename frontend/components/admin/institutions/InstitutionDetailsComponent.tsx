'use client';

import { ArrowLeft, Edit, Plus, Building2, Settings, MapPin, Globe, Check, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import ConfirmUpdateStatusModal from '@/components/admin/institutions/ConfirmUpdateStatusModal';
import EditInstitutionModal from '@/components/admin/institutions/EditInstitutionModal';
import ServiceDetailsModal from '@/components/admin/institutions/ServiceDetailsModal';
import ServiceItem from '@/components/admin/institutions/ServiceItem';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLoader } from '@/contexts/LoaderContext';
import { useGetInstitution } from '@/hooks/institution/useGetInstitution';
import { InstitutionStatus } from '@/types/Institution';
import type { Service } from '@/types/Service';

type InstitutionDetailsComponentProps = {
  institutionId: string;
};

const InstitutionDetailsComponent = ({ institutionId }: InstitutionDetailsComponentProps) => {
  const { showLoader, hideLoader } = useLoader();
  const { institution, isLoading, isError, error, refetch } = useGetInstitution(institutionId);

  const [showUpdateStateModal, setShowUpdateStateModal] = useState(false);
  const [newStatus, setNewStatus] = useState<InstitutionStatus>(InstitutionStatus.PENDING);

  const [openEditModal, setOpenEditModal] = useState(false);

  const [openServiceDetails, setOpenServiceDetails] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    if (isLoading) {
      showLoader();
    } else {
      hideLoader();
    }
  }, [isLoading, showLoader, hideLoader]);
  const serviceCount = institution?.services?.length ?? 0;

  const handleViewService = (service: Service) => {
    setSelectedService(service);
    setOpenServiceDetails(true);
  };

  const handleEditService = (service: Service) => {
    console.warn('Modifier le service:', service);
  };

  const handleDeleteService = (service: Service) => {
    console.warn('Supprimer le service:', service);
  };

  // Fonctions utilitaires
  const formatDate = (d?: string) => {
    if (!d) return '—';
    try {
      return new Intl.DateTimeFormat('fr-FR').format(new Date(d));
    } catch {
      return d;
    }
  };

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

  if (!institution) return null;

  const renderStatusChip = (status: InstitutionStatus) => {
    switch (status) {
      case InstitutionStatus.ACTIVE:
        return (
          <Badge className='bg-green-300/30  rounded-xl flex items-center gap-2'>
            <div className='h-3 w-3 rounded-full bg-green-500/80' />
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

  const activationButton = (
    <Button
      type='button'
      onClick={() => {
        setNewStatus(InstitutionStatus.ACTIVE);
        setShowUpdateStateModal(true);
      }}
      className='h-8 rounded-xl bg-primary-300 px-4 text-[14px] font-medium text-white shadow-sm hover:bg-primary-400 active:bg-primary-400'
    >
      <Check className='mr-2 h-4 w-4' />
      Activer
    </Button>
  );

  const desactivationButton = (
    <Button
      type='button'
      onClick={() => {
        setNewStatus(InstitutionStatus.INACTIVE);
        setShowUpdateStateModal(true);
      }}
      className='h-8 rounded-xl bg-[#E00010] px-4 text-[14px] font-medium text-white shadow-sm hover:bg-[#C8000E] active:bg-[#B0000C]'
    >
      <X className='mr-2 h-4 w-4' />
      Rejeter
    </Button>
  );

  return (
    <>
      <div className='mb-4'>
        <Link
          href='/institutions'
          className='flex items-center gap-2 text-gray-600 hover:text-gray-900'
        >
          <ArrowLeft className='w-5 h-5' /> <span>Retour aux Institutions</span>
        </Link>
      </div>

      <div className='flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start'>
        <div className='flex items-center gap-4'>
          <div className='p-2 border-2 border-gray-200 rounded-2xl h-16 w-16 sm:h-20 sm:w-20 overflow-hidden flex items-center justify-center bg-gray-50'>
            {institution.logoUrl ? (
              <Image
                src={institution.logoUrl}
                alt={`Logo ${institution.name}`}
                width={80}
                height={80}
                className='object-contain'
              />
            ) : (
              <div className='text-tertiary-400 text-3xl font-semibold'>
                {institution.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div>
            <h2 className='text-3xl font-semibold text-tertiary-400'>{institution.name}</h2>
            <div className='mt-2 flex flex-wrap items-center gap-2'>
              <Badge
                variant='outline'
                className='bg-white text-gray-900 border border-gray-200 rounded-xl'
              >
                {institution.type}
              </Badge>
              <div className='flex items-center gap-3'>{renderStatusChip(institution.status)}</div>
              <Badge
                variant='outline'
                className='bg-white text-gray-900 border border-gray-200 rounded-xl'
              >
                {institution.pays}
              </Badge>
            </div>
          </div>
        </div>

        <div className='flex items-center gap-3'>
          <Button
            variant='outline'
            className='gap-2 bg-primary-300 text-white hover:bg-primary-400'
            onClick={() => setOpenEditModal(true)}
          >
            <Edit className='w-5 h-5' />
            Modifier
          </Button>
        </div>
      </div>

      <div className='mt-4'>
        <Tabs defaultValue='details' className='w-full'>
          <TabsList className='w-full justify-start overflow-x-auto bg-[#E9ECEF] p-1 rounded-full gap-1'>
            <TabsTrigger
              value='details'
              className='group inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-normal
               text-gray-700 hover:text-gray-900 data-[state=active]:bg-white
               data-[state=active]:text-gray-900 transition'
            >
              <Building2 className='h-4 w-4 text-gray-600 group-data-[state=active]:text-gray-900' />
              Détails de l&apos;institution
            </TabsTrigger>

            <TabsTrigger
              value='services'
              className='group inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-normal
               text-gray-700 hover:text-gray-900 data-[state=active]:bg-white
               data-[state=active]:text-gray-900 transition'
            >
              <Settings className='h-4 w-4 text-gray-600 group-data-[state=active]:text-gray-900' />
              Services ({serviceCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value='details' className='mt-4'>
            <div className='rounded-2xl bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.10)] border border-[#E5E7EB]'>
              {/* Description */}
              <div>
                <p className='text-[14px] font-medium text-tertiary-400/60'>Description</p>
                <p className='mt-1 text-[18px] text-tertiary-400'>
                  {institution.description || '—'}
                </p>
              </div>

              {/* Site web */}
              <div className='mt-6'>
                <div className='flex items-center gap-2'>
                  <Globe className='h-4 w-4 text-[#9CA3AF]' />
                  <p className='text-[14px] font-medium text-tertiary-400/60'>Site web</p>
                </div>

                {institution.website ? (
                  <a
                    href={institution.website}
                    target='_blank'
                    rel='noreferrer'
                    className='mt-1 block text-[18px] text-primary-300 hover:underline break-words'
                  >
                    {institution.website}
                  </a>
                ) : (
                  <p className='mt-1 text-[18px] text-[#111827]'>—</p>
                )}
              </div>

              {/* Zones couvertes */}
              <div className='mt-6'>
                <p className='text-[14px] font-medium text-tertiary-400/60'>Zones couvertes</p>

                <div className='mt-1 flex flex-wrap gap-2'>
                  {institution.geographicZones?.length ? (
                    institution.geographicZones.map(zone => (
                      <span
                        key={zone}
                        className='inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-[14px] font-medium text-tertiary-400'
                      >
                        <MapPin className='h-3.5 w-3.5 text-[14px] text-tertiary-400' />
                        {zone}
                      </span>
                    ))
                  ) : (
                    <span className='text-sm text-[#111827]'>—</span>
                  )}
                </div>
              </div>

              {/* Séparateur */}
              <div className='mt-6 h-px w-full bg-[#E5E7EB]' />

              {/* Stats */}
              <div className='mt-6 grid gap-8 sm:grid-cols-3'>
                <div>
                  <p className='text-[14px] font-medium text-tertiary-400/60'>Services</p>
                  <p className='mt-1 text-[16px] font-medium text-tertiary-400'>{serviceCount}</p>
                </div>

                <div>
                  <p className='text-[14px] font-medium text-tertiary-400/60'>Créée le</p>
                  <p className='mt-1 text-[16px] font-medium text-tertiary-400'>
                    {formatDate(institution.createdAt)}
                  </p>
                </div>

                <div>
                  <p className='text-[14px] font-medium text-tertiary-400/60'>Mise à jour</p>
                  <p className='mt-1 text-[16px] font-medium text-tertiary-400'>
                    {formatDate(institution.updatedAt)}
                  </p>
                </div>
              </div>

              <div className='mt-6 flex items-center gap-12'>
                {institution.status === InstitutionStatus.PENDING && (
                  <>
                    {activationButton}
                    {desactivationButton}
                  </>
                )}

                {institution.status === InstitutionStatus.ACTIVE && desactivationButton}
                {institution.status === InstitutionStatus.INACTIVE && activationButton}
              </div>
            </div>
          </TabsContent>

          <TabsContent value='services' className='mt-4'>
            <div className='flex items-center justify-between my-4'>
              <h2 className='font-poppins text-base font-normal leading-6 tracking-normal text-[#37415199]'>
                Gérez les services financiers proposés par {institution.name}
              </h2>
              <Link href={`/institutions/${institutionId}/service/new`}>
                <Button className='bg-primary-300 text-white hover:bg-primary-4 gap-2'>
                  <Plus className='w-4 h-4' />
                  Nouveau service
                </Button>
              </Link>
            </div>
            <div className='rounded-2xl bg-white shadow-md'>
              <ServiceItem
                services={institution.services || []}
                onView={handleViewService}
                onEdit={handleEditService}
                onDelete={handleDeleteService}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <EditInstitutionModal
        open={openEditModal}
        onOpenChange={setOpenEditModal}
        refresh={() => refetch()}
        institution={institution}
      />

      <ConfirmUpdateStatusModal
        isOpen={showUpdateStateModal}
        onClose={() => setShowUpdateStateModal(false)}
        refresh={() => refetch()}
        institution={institution}
        status={newStatus}
      />
      <ServiceDetailsModal
        open={openServiceDetails}
        onOpenChange={setOpenServiceDetails}
        service={selectedService}
      />
    </>
  );
};

export default InstitutionDetailsComponent;
