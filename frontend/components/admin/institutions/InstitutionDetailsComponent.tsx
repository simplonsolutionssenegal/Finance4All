'use client';

import {
  type LucideIcon,
  ArrowLeft,
  Edit,
  Plus,
  Building2,
  Settings,
  Mail,
  Phone,
  User,
  MapPin,
  Globe,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import ConfirmUpdateStatusModal from '@/components/admin/institutions/ConfirmUpdateStatusModal';
import EditInstitutionModal from '@/components/admin/institutions/EditInstitutionModal';
import ServiceDetailsModal from '@/components/admin/institutions/ServiceDetailsModal';
import ServiceItem from '@/components/admin/institutions/ServiceItem';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLoader } from '@/contexts/LoaderContext';
import { useGetInstitution } from '@/hooks/institution/useGetInstitution';
import { InstitutionStatus } from '@/types/Institution';
import type { Service } from '@/types/Service';

type InstitutionDetailsComponentProps = {
  institutionId: string;
};

const Stat = ({ label, value }: { readonly label: string; readonly value: string }) => {
  return (
    <div className=''>
      <p className='text-xs text-gray-500'>{label}</p>
      <p className='mt-1 text-xl text-gray-900'>{value}</p>
    </div>
  );
};

const InfoBlock = ({ title, value }: { readonly title: string; readonly value?: string }) => {
  return (
    <div>
      <Label className='font-semibold'>{title}</Label>
      <p className='mt-2 text-sm break-words'>{value || '—'}</p>
    </div>
  );
};

const InfoRow = ({
  Icon,
  label,
  value,
  href,
}: {
  readonly Icon: LucideIcon;
  readonly label: string;
  readonly value?: string;
  readonly href?: boolean;
}) => {
  return (
    <div className='space-y-1'>
      <div className='flex items-center gap-2'>
        <Icon className='h-4 w-4 text-gray-500' />
        <Label className='text-sm text-gray-500'>{label}</Label>
      </div>
      {href && value ? (
        <a
          href={value}
          target='_blank'
          rel='noreferrer'
          className='block text-sm text-cyan-700 hover:underline break-words'
        >
          {value}
        </a>
      ) : (
        <p className='text-sm text-gray-900 break-words'>{value || '—'}</p>
      )}
    </div>
  );
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
      onClick={() => {
        setNewStatus(InstitutionStatus.ACTIVE);
        setShowUpdateStateModal(true);
      }}
      className='bg-green-500 text-white font-bold text-sm hover:bg-green-600'
    >
      ACTIVER
    </Button>
  );

  const desactivationButton = (
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
              <div className='text-gray-400 text-3xl font-bold'>
                {institution.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div>
            <h1 className='text-3xl font-bold text-gray-900'>{institution.name}</h1>
            <div className='mt-2 flex flex-wrap items-center gap-2'>
              <Badge
                variant='outline'
                className='bg-white text-gray-900 border border-gray-200 rounded-xl'
              >
                Mobile Money
              </Badge>
              <div className='flex items-center gap-3'>{renderStatusChip(institution.status)}</div>
              <Badge
                variant='outline'
                className='bg-white text-gray-900 border border-gray-200 rounded-xl'
              >
                Sénégal et Cameroun
              </Badge>
            </div>
          </div>
        </div>

        <div className='flex items-center gap-3'>
          <Button
            variant='outline'
            className='gap-2 bg-primary-300 text-white hover:bg-customBlue'
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
            <div className='rounded-2xl bg-white p-4 sm:p-6 shadow-md'>
              <div className='mb-4'>
                <InfoBlock title='Description' value={institution.description || '—'} />
              </div>
              <div className='grid gap-6 md:grid-cols-2'>
                <div className='space-y-3'>
                  <InfoRow Icon={Globe} label='Site web' value={institution.website} href />
                  <InfoRow Icon={Phone} label='Téléphone' value='+221 33 869 60 00' />
                  <InfoRow Icon={User} label='Personne de contact' value='Amadou Diallo' />
                </div>

                <div className='space-y-3'>
                  <InfoRow Icon={Mail} label='Email' value='contact@orangemoney.sn' />
                  <InfoRow Icon={MapPin} label='Adresse' value='Dakar, Sénégal' />
                  <InfoRow Icon={Phone} label='Téléphone du contact' value='+221 77 123 45 67' />
                </div>
              </div>
              <div className='mt-3 flex flex-wrap gap-2'>
                {institution.geographicZones?.map(zone => (
                  <Badge
                    key={zone}
                    variant='outline'
                    className='inline-flex items-center gap-1.5
                 border border-[#EAEAEA] bg-white text-gray-800
                rounded-xl px-2 py-1'
                  >
                    <MapPin className='h-3.5 w-3.5 text-gray-600' aria-hidden='true' />
                    <span className='leading-none'>{zone}</span>
                  </Badge>
                ))}
              </div>
              <Separator className='border border-gray-200 my-4' />
              <div className='rounded-xl p-4 bg-gray-50 mt-2 grid gap-4 sm:grid-cols-3'>
                <Stat label='Services' value={serviceCount.toString()} />
                <Stat label='Créée le' value={formatDate(institution.createdAt)} />
                <Stat label='Mise à jour' value={formatDate(institution.updatedAt)} />
              </div>

              <Separator className='border border-gray-300 my-2' />
              <div className='flex items-center justify-between'>
                {/* <div className='flex items-center gap-3'>
                  {renderStatusChip(institution.status)}
                </div> */}

                <div className='flex gap-3'>
                  {institution.status === InstitutionStatus.PENDING && (
                    <>
                      {desactivationButton}
                      {activationButton}
                    </>
                  )}
                  {institution.status === InstitutionStatus.ACTIVE && desactivationButton}
                  {institution.status === InstitutionStatus.INACTIVE && activationButton}
                </div>
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
