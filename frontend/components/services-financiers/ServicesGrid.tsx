import { Calendar } from 'lucide-react';
import React from 'react';

import { formatCurrency, formatPercentage } from '../../data/MockData';
import type { FinancialService } from '../../types/FinancialServices';
import { Badge } from '../ui/badge';

interface ServicesGridProps {
  services: FinancialService[];
  onSchedule: (service: FinancialService) => void;
}

export const ServicesGrid: React.FC<ServicesGridProps> = props => {
  const { services, onSchedule } = props;
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {services.map(service => (
        <div
          key={service.id}
          className='bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow'
        >
          <div className='flex justify-between items-start mb-4'>
            <div>
              <h3 className='text-lg font-semibold text-gray-900 mb-1'>{service.designation}</h3>
              <p className='text-sm text-gray-500'>{service.institution}</p>
            </div>
            <Badge
              variant={
                (service.type === 'Epargne' && 'info') ||
                (service.type === 'Crédit' && 'warning') ||
                'default'
              }
            >
              {service.type}
            </Badge>
          </div>

          <div className='space-y-3 mb-4'>
            <div className='flex justify-between'>
              <span className='text-sm text-gray-500'>Montant max:</span>
              <span className='text-sm font-medium text-gray-900'>
                {formatCurrency(service.maxAmount)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-gray-500'>Taux:</span>
              <span className='text-sm font-medium text-gray-900'>
                {formatPercentage(service.interestRate)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-gray-500'>Remboursement:</span>
              <span className='text-sm font-medium text-gray-900'>{service.reimbursement}</span>
            </div>
          </div>

          <div className='mb-4'>
            <p className='text-sm text-gray-600 line-clamp-2'>{service.description}</p>
          </div>

          <div className='flex justify-between items-center pt-4 border-t border-gray-200'>
            <div className='flex flex-wrap gap-1'>
              {service.geographicZones.map(zone => (
                <span key={zone} className='text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded'>
                  {zone}
                </span>
              ))}
            </div>

            <div className='flex items-center space-x-2'>
              <button
                onClick={() => onSchedule(service)}
                className='text-green-400 hover:text-green-600 p-1'
                title='Échéancier'
              >
                <Calendar className='w-4 h-4' />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
