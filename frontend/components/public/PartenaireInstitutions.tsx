'use client';

import Image from 'next/image';
import { useState } from 'react';

import type { Institution } from '@/types/Institution';

interface PartnerInstitutionsProps {
  institutions: Institution[];
  title?: string;
  initialDisplayCount?: number;
  incrementCount?: number;
}

const PartenaireInstitutions = ({
  institutions,
  title,
  initialDisplayCount = 8,
  incrementCount = 8,
}: PartnerInstitutionsProps) => {
  const [displayCount, setDisplayCount] = useState(initialDisplayCount);

  const handleShowMore = () => {
    setDisplayCount(prev => prev + incrementCount);
  };

  const displayedInstitutions = institutions.slice(0, displayCount);
  const hasMore = displayCount < institutions.length;

  return (
    <section className='py-16'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <h2 className='text-3xl font-bold text-center mb-12'>{title}</h2>
        <div className='grid grid-cols-4 md:grid-cols-8 gap-6 mb-8'>
          {displayedInstitutions.map(institution => (
            <div
              key={institution.id}
              className='relative w-20 h-12 rounded-md border-1 border-gray-700 bg-white'
            >
              <Image
                src={institution.logoUrl || '/placeholder-logo.png'}
                alt={institution.name}
                fill
                className='object-contain p-1'
                sizes='80px'
                priority={false}
              />
            </div>
          ))}
        </div>
        {hasMore && (
          <div className='text-center'>
            <button
              onClick={handleShowMore}
              className='border-b-2 border-gray-800 text-gray-800 font-semibold pb-1 hover:border-teal-500 hover:text-teal-500 transition-colors'
            >
              Afficher plus
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default PartenaireInstitutions;
