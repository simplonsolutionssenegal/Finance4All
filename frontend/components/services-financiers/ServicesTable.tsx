import { ChevronUp, ChevronDown } from 'lucide-react';
import React from 'react';

import { formatCurrency, formatPercentage } from '../../lib/formatters';
import type { FinancialService, SearchAndFilterState } from '../../types/FinancialServices';
import { Badge } from '../ui/badge';

import {
  displayDesignation,
  displayInstitutionName,
  displayMaxAmount,
  displayMinAmount,
  mapTypeToLabel,
} from './normalizeService';

interface ServicesTableProps {
  services: FinancialService[];
  searchAndFilter: SearchAndFilterState;
  onSort: (field: SearchAndFilterState['sortBy']) => void;
  onSchedule: (service: FinancialService) => void;
}

export const ServicesTable: React.FC<ServicesTableProps> = props => {
  const { services, searchAndFilter, onSort, onSchedule: _onSchedule } = props;
  const formatFrais = (frais: any) => {
    const parts: string[] = [];
    if (!frais) return 'Aucun frais';
    if (frais.montantFixe) parts.push(`${frais.montantFixe} FCFA fixe`);
    if (frais.pourcentage) parts.push(`${frais.pourcentage}%`);
    if (frais.minimum) parts.push(`min: ${frais.minimum} FCFA`);
    if (frais.maximum) parts.push(`max: ${frais.maximum} FCFA`);
    return parts.length > 0 ? parts.join(', ') : 'Aucun frais';
  };
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
      <div className='overflow-x-auto w-full'>
        <table className='w-full divide-y divide-gray-200'>
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
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Frais
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
                Zones géographiques
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Infrastructure d&apos;accès
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {services.map(service => (
              <tr key={service.id} className='hover:bg-gray-50'>
                <td className='px-6 py-4 whitespace-normal'>
                  <div className='flex items-center'>
                    <div>
                      <div className='text-sm font-medium text-gray-900 break-words'>
                        {displayDesignation(service)}
                      </div>
                      <div className='text-sm text-gray-500 break-words'>
                        {displayInstitutionName(service)}
                      </div>
                      {service.longName && (
                        <div className='text-xs text-gray-500 mt-1 break-words'>
                          {service.longName}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <Badge
                    variant={
                      (service.type === 'EPARGNE' && 'info') ||
                      (service.type === 'CREDIT' && 'warning') ||
                      'default'
                    }
                  >
                    {mapTypeToLabel(service.type)}
                  </Badge>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-gray-900'>{formatFrais(service.frais)}</div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-gray-900'>
                    {formatCurrency(displayMaxAmount(service))}
                  </div>
                  <div className='text-sm text-gray-500'>
                    Min: {formatCurrency(displayMinAmount(service))}
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm font-medium text-gray-900'>
                    {formatPercentage(service.interestRate)}
                  </div>
                </td>
                {/* Conditions d'accès column removed to save horizontal space */}

                <td className='px-6 py-4 whitespace-nowrap align-top'>
                  <div className='flex flex-wrap gap-1'>
                    {(service.geographicZones || []).map(zone => (
                      <span
                        key={zone}
                        className='text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded'
                      >
                        {zone}
                      </span>
                    ))}
                  </div>
                </td>

                <td className='px-6 py-4 whitespace-nowrap align-top'>
                  {service.infrastructureAccess && service.infrastructureAccess.length > 0 ? (
                    <div className='flex flex-wrap gap-1.5'>
                      {service.infrastructureAccess.map((i: any) => (
                        <Badge key={String(i)} variant='secondary' className='text-xs bg-green-100'>
                          {i}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className='text-sm text-gray-500'>Aucune</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
