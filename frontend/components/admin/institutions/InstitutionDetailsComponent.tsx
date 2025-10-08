'use client';

import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useLoader } from '@/contexts/LoaderContext';
import { useGetInstitution } from '@/hooks/institution/useGetInstitution';
import { InstitutionStatus } from '@/types/Institution';

interface InstitutionDetailsComponentProps {
  institutionId: string;
}

const InstitutionDetailsComponent = ({ institutionId }: InstitutionDetailsComponentProps) => {
  const { showLoader, hideLoader } = useLoader();
  const { institution, isLoading, isError, error } = useGetInstitution(institutionId);

  useEffect(() => {
    if (isLoading) {
      showLoader();
    } else {
      hideLoader();
    }
  }, [isLoading, showLoader, hideLoader]);

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
        <div className='border-2 border-gray-200 rounded-2xl h-32 w-32 overflow-hidden flex items-center justify-center bg-gray-50'>
          {institution.logoUrl ? (
            <Image
              src={institution.logoUrl}
              alt={`Logo de ${institution.name}`}
              width={128}
              height={128}
              className='object-contain'
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
                  <Button className='bg-red-500 text-white font-bold text-sm hover:bg-red-600'>
                    REJETER
                  </Button>
                  <Button className='bg-green-500 text-white font-bold text-sm hover:bg-green-600'>
                    ACTIVER
                  </Button>
                </>
              )}
              {institution.status === InstitutionStatus.ACTIVE && (
                <Button className='bg-red-500 text-white font-bold text-sm hover:bg-red-600'>
                  DÉSACTIVER
                </Button>
              )}
              {institution.status === InstitutionStatus.INACTIVE && (
                <Button className='bg-green-500 text-white font-bold text-sm hover:bg-green-600'>
                  ACTIVER
                </Button>
              )}
            </div>
          </div>
          <div className='flex flex-1 gap-4 items-center'>
            {renderStatus(institution.status)}
            <Badge className='bg-[#6CB9C642] p-2 rounded-xl'>{institution.website}</Badge>
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
        <h2 className='text-2xl font-bold text-gray-900 mb-4'>Produits Financiers</h2>
        <p className='text-gray-500'>Aucun produit financier pour le moment.</p>
      </div>
    </div>
  );
};

export default InstitutionDetailsComponent;
