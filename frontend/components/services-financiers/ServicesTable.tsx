import { ChevronUp, ChevronDown, Calendar } from 'lucide-react';
import React from 'react';

import { formatCurrency, formatPercentage } from '../../data/MockData';
import type { FinancialService, SearchAndFilterState } from '../../types/FinancialServices';
import { Badge } from '../ui/badge';

interface ServicesTableProps {
  services: FinancialService[];
  searchAndFilter: SearchAndFilterState;
  onSort: (field: SearchAndFilterState['sortBy']) => void;
  onSchedule: (service: FinancialService) => void;
}

export const ServicesTable: React.FC<ServicesTableProps> = props => {
  const { services, searchAndFilter, onSort, onSchedule } = props;
  const getSortIcon = (field: SearchAndFilterState['sortBy']) => {
    if (searchAndFilter.sortBy !== field) return null;
    return searchAndFilter.sortOrder === 'asc' ? (
      <ChevronUp className='w-4 h-4' />
    ) : (
      <ChevronDown className='w-4 h-4' />
    );
  };

  return (
    <div id='services-table' className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100'
                onClick={() => onSort('designation')}
              >
                <div className='flex items-center space-x-1'>
                  <span>Désignation</span>
                  {getSortIcon('designation')}
                </div>
              </th>
              <th
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100'
                onClick={() => onSort('type')}
              >
                <div className='flex items-center space-x-1'>
                  <span>Type</span>
                  {getSortIcon('type')}
                </div>
              </th>
              <th
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100'
                onClick={() => onSort('maxAmount')}
              >
                <div className='flex items-center space-x-1'>
                  <span>Montant Max.</span>
                  {getSortIcon('maxAmount')}
                </div>
              </th>
              <th
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100'
                onClick={() => onSort('interestRate')}
              >
                <div className='flex items-center space-x-1'>
                  <span>Taux</span>
                  {getSortIcon('interestRate')}
                </div>
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Remboursement
              </th>
              <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {services.map(service => (
              <tr key={service.id} className='hover:bg-gray-50'>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='flex items-center'>
                    <div>
                      <div className='text-sm font-medium text-gray-900'>{service.designation}</div>
                      <div className='text-sm text-gray-500'>{service.institution}</div>
                    </div>
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <Badge
                    variant={
                      (service.type === 'Epargne' && 'info') ||
                      (service.type === 'Crédit' && 'warning') ||
                      'default'
                    }
                  >
                    {service.type}
                  </Badge>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-gray-900'>{formatCurrency(service.maxAmount)}</div>
                  <div className='text-sm text-gray-500'>
                    Min: {formatCurrency(service.minAmount)}
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm font-medium text-gray-900'>
                    {formatPercentage(service.interestRate)}
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-gray-900'>{service.reimbursement}</div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                  <div className='flex items-center space-x-2 justify-end'>
                    <button
                      onClick={() => onSchedule(service)}
                      className='text-green-400 hover:text-green-600 p-1'
                      title='Échéancier'
                    >
                      <Calendar className='w-4 h-4' />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
