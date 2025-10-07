import React from 'react';

import type { Institution } from '../../types/FinancialServices';
import { Badge } from '../ui/badge';

interface InstitutionCardProps {
  institution: Institution;
}

export const InstitutionCard: React.FC<InstitutionCardProps> = ({ institution }) => {
  return (
    <div className='bg-white rounded-lg border border-gray-200 p-6 mb-6'>
      <div className='flex items-start space-x-4'>
        {/* Logo */}
        <div className='w-20 h-20 bg-red-600 rounded-lg flex items-center justify-center'>
          <div className='text-white font-bold text-sm text-center'>
            <div>SOCIÉTÉ</div>
            <div>GÉNÉRALE</div>
          </div>
        </div>

        {/* Info */}
        <div className='flex-1'>
          <div className='flex items-center space-x-3 mb-2'>
            <h2 className='text-xl font-semibold text-gray-900'>{institution.name}</h2>
            <Badge variant='success' className='flex items-center'>
              <div className='w-2 h-2 bg-green-500 rounded-full mr-1' />
              {institution.status}
            </Badge>
            <span className='text-teal-500 text-sm'>{institution.website}</span>
          </div>

          <p className='text-gray-600 text-sm mb-4 leading-relaxed'>{institution.description}</p>
        </div>
      </div>
    </div>
  );
};
