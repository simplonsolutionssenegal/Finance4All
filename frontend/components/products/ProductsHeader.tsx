// frontend/components/products/OrganizationHeader.tsx

'use client';

import { Globe, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface Zone {
  id: string | number;
  label: string;
}

interface OrganizationHeaderProps {
  logoSrc: string;
  name: string;
  status: 'ACTIF' | 'INACTIF';
  website?: string;
  description?: string;
  zones: Zone[];
  onReject?: () => void;
  onActivate?: () => void;
}

export default function ProductsHeader({
  logoSrc,
  name,
  status,
  website,
  description,
  zones,
  onReject,
  onActivate,
}: Readonly<OrganizationHeaderProps>) {
  const [localZones, setLocalZones] = useState<Zone[]>(zones);
  const isActive = status === 'ACTIF';

  const removeZone = (id: string | number) => {
    setLocalZones(prev => prev.filter(z => z.id !== id));
    // Ici tu peux appeler ton API pour persister
  };

  return (
    <section className='w-full border-b border-b-gray-200 bg-white p-4'>
      <div className='flex items-start justify-between gap-4'>
        <div className='flex flex-1 gap-4'>
          {/* Logo */}
          <div className='relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white border border-gray-200'>
            <Image
              src={logoSrc}
              alt={`${name} logo`}
              fill
              className='object-contain p-2'
              sizes='80px'
              priority
            />
          </div>

          {/* Infos */}
          <div className='flex-1'>
            <div className='flex flex-wrap items-center gap-3'>
              <h2 className='text-xl font-semibold leading-none'>{name}</h2>

              <div className='flex basis-full items-center gap-3'>
                {/* Statut */}
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
                    isActive ? 'bg-[#E8FBF0] text-[#28A745]' : 'bg-[#FFECEC] text-[#D93025]'
                  }`}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      isActive ? 'bg-[#28A745]' : 'bg-[#D93025]'
                    }`}
                  />
                  {status}
                </span>

                {/* Site web */}
                {website && (
                  <a
                    href={`https://${website.replace(/^https?:\/\//, '')}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-2 rounded-full bg-[#EAF6F8] px-3 py-1 text-sm text-[#4AA9B7] hover:underline'
                  >
                    <Globe className='h-4 w-4' />
                    <span className='truncate max-w-[220px]'>{website}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Description */}
            {description && (
              <p className='mt-2 max-w-4xl text-xs leading-snug text-muted-foreground text-[#979797]'>
                {description}
              </p>
            )}

            {/* Zones géographiques */}
            <div className='mt-3 flex flex-wrap gap-3'>
              {localZones.map(z => (
                <span
                  key={z.id}
                  className='inline-flex items-center gap-2 rounded-md border border-[#EAEAEA] bg-[#EAEAEA] px-2 py-1 text-sm'
                >
                  {z.label}
                  <button
                    type='button'
                    onClick={() => removeZone(z.id)}
                    aria-label={`Retirer ${z.label}`}
                    className='grid h-5 w-5 place-items-center rounded-full bg-[#EAEAEA] hover:bg-[#EFEFEF]'
                  >
                    <X className='h-3.5 w-3.5 text-[#F97316] rounded-full border-2 border-[#F97316]' />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Boutons actions */}
        {(onReject || onActivate) && (
          <div className='flex shrink-0 items-start gap-3'>
            {onReject && (
              <button
                type='button'
                onClick={onReject}
                className='rounded-md bg-[#E3382B] px-4 py-2 text-sm text-white hover:opacity-90'
              >
                REJETER
              </button>
            )}
            {onActivate && (
              <button
                type='button'
                onClick={onActivate}
                className='rounded-md bg-[#42B95F] px-4 py-2 text-sm text-white hover:opacity-90'
              >
                ACTIVER
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
