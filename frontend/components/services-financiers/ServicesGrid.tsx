import React from 'react';

import { formatCurrency, formatPercentage } from '../../lib/formatters';
import type { FinancialService } from '../../types/FinancialServices';
import { Badge } from '../ui/badge';

import {
  displayDesignation,
  displayInstitutionName,
  displayGeographicZones,
  displayMaxAmount,
  mapTypeToLabel,
} from './normalizeService';

interface ServicesGridProps {
  services: FinancialService[];
  onSchedule: (service: FinancialService) => void;
}

export const ServicesGrid: React.FC<ServicesGridProps> = props => {
  const { services, onSchedule: _onSchedule } = props;
  const formatFrais = (frais: any) => {
    const parts: string[] = [];
    if (!frais) return 'Aucun frais';
    if (frais.montantFixe) parts.push(`${frais.montantFixe} FCFA fixe`);
    if (frais.pourcentage) parts.push(`${frais.pourcentage}%`);
    if (frais.minimum) parts.push(`min: ${frais.minimum} FCFA`);
    if (frais.maximum) parts.push(`max: ${frais.maximum} FCFA`);
    return parts.length > 0 ? parts.join(', ') : 'Aucun frais';
  };
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {services.map(service => (
        <div
          key={service.id}
          className='bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow'
        >
          <div className='flex justify-between items-start mb-4'>
            <div>
              <h3 className='text-lg font-semibold text-gray-900 mb-1'>
                {displayDesignation(service)}
              </h3>
              <p className='text-sm text-gray-500'>{displayInstitutionName(service)}</p>
              {service.longName && (
                <p className='text-xs text-gray-500 mt-1 line-clamp-1'>{service.longName}</p>
              )}
            </div>
            <Badge
              variant={
                (service.type === 'EPARGNE' && 'info') ||
                (service.type === 'CREDIT' && 'warning') ||
                'default'
              }
            >
              {mapTypeToLabel(service.type)}
            </Badge>
          </div>

          <div className='space-y-3 mb-4'>
            <div className='flex justify-between'>
              <span className='text-sm text-gray-500'>Montant max:</span>
              <span className='text-sm font-medium text-gray-900'>
                {formatCurrency(displayMaxAmount(service))}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-gray-500'>Taux:</span>
              <span className='text-sm font-medium text-gray-900'>
                {formatPercentage(service.interestRate)}
              </span>
            </div>
            <div>
              <p className='text-sm font-semibold text-gray-700 mt-2'>Frais</p>
              <p className='text-sm text-gray-600'>{formatFrais(service.frais)}</p>
            </div>
          </div>

          <div className='mb-4'>
            <p className='text-sm text-gray-600 line-clamp-2'>{service.description}</p>
          </div>

          {service.conditionAccess && service.conditionAccess.length > 0 && (
            <div className='mb-3'>
              <p className='text-sm font-semibold text-gray-700 mb-2'>Conditions d&apos;accès</p>
              <div className='flex flex-wrap gap-1.5'>
                {service.conditionAccess.map((c: any) => (
                  <Badge key={String(c)} variant='outline' className='text-xs'>
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {service.plafonds && service.plafonds.length > 0 && (
            <div className='mb-3'>
              <p className='text-sm font-semibold text-gray-700 mb-2'>Plafonds</p>
              <div className='flex flex-wrap gap-1.5'>
                {service.plafonds.map((p: any) => (
                  <Badge key={String(p)} variant='secondary' className='text-xs bg-blue-100'>
                    {p}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {service.infrastructureAccess && service.infrastructureAccess.length > 0 && (
            <div className='mb-3'>
              <p className='text-sm font-semibold text-gray-700 mb-2'>
                Infrastructure d&apos;accès
              </p>
              <div className='flex flex-wrap gap-1.5'>
                {service.infrastructureAccess.map((i: any) => (
                  <Badge key={String(i)} variant='secondary' className='text-xs bg-green-100'>
                    {i}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className='flex justify-between items-center pt-4 border-t border-gray-200'>
            <div className='flex flex-wrap gap-1'>
              {displayGeographicZones(service).map(zone => (
                <span key={zone} className='text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded'>
                  {zone}
                </span>
              ))}
            </div>

            <div className='flex items-center space-x-2' />
          </div>
        </div>
      ))}
    </div>
  );
};
