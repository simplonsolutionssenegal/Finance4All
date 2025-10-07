import { X } from 'lucide-react';
import React, { useState } from 'react';

import type { FilterOptions } from '../../types/FinancialServices';
import { Button } from '../ui/button';

interface ServiceFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const ServiceFilters: React.FC<ServiceFiltersProps> = ({
  filters,
  onFiltersChange,
  isOpen,
  onToggle,
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (
    category: keyof FilterOptions,
    value: string | FilterOptions['date']
  ) => {
    if (category === 'date') {
      setLocalFilters(prev => ({ ...prev, [category]: value as FilterOptions['date'] }));
    } else {
      const currentValues = localFilters[category] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];

      setLocalFilters(prev => ({ ...prev, [category]: newValues }));
    }
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onToggle();
  };

  const handleReset = () => {
    const resetFilters: FilterOptions = {
      serviceType: [],
      geographicZone: [],
      institut: [],
      date: 'Récente',
    };
    setLocalFilters(resetFilters);
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/60 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-lg font-semibold'>Filtres</h3>
          {/* close button: accessible name + removed from tab order so first tab lands on first form control */}
          <button
            onClick={onToggle}
            className='text-gray-400 hover:text-gray-600'
            aria-label='Fermer'
            tabIndex={-1}
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        <div className='space-y-6'>
          {/* Type de produit */}
          <div>
            <h4 className='font-medium text-gray-900 mb-3'>Type de produit</h4>
            <div className='flex space-x-2 mb-2'>
              {/* Réinstaller now calls handleReset and is removed from tab order to avoid stealing focus */}
              <button
                onClick={handleReset}
                className='text-orange-500 text-sm hover:underline'
                tabIndex={-1}
              >
                Réinstaller
              </button>
            </div>
            <div className='space-y-2'>
              {['Epargne', 'Crédit', 'Autre type'].map(type => (
                <label key={type} className='flex items-center'>
                  <input
                    type='checkbox'
                    checked={localFilters.serviceType.includes(
                      type as FilterOptions['serviceType'][number]
                    )}
                    onChange={() => handleFilterChange('serviceType', type)}
                    className='mr-2 text-teal-500 focus:ring-teal-500'
                  />
                  <span className='text-sm'>{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Zone géographique */}
          <div>
            <h4 className='font-medium text-gray-900 mb-3'>Zone géographique</h4>
            <div className='space-y-2'>
              {['Zone Géo A', 'Zone Géo B'].map(zone => (
                <label key={zone} className='flex items-center'>
                  <input
                    type='checkbox'
                    checked={localFilters.geographicZone.includes(
                      zone as FilterOptions['geographicZone'][number]
                    )}
                    onChange={() => handleFilterChange('geographicZone', zone)}
                    className='mr-2 text-teal-500 focus:ring-teal-500'
                  />
                  <span className='text-sm'>{zone}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Institut */}
          <div>
            <h4 className='font-medium text-gray-900 mb-3'>Institut</h4>
            <div className='space-y-2'>
              {['SIMPLON', 'PAYTECH SN', 'ODK'].map(institut => (
                <label key={institut} className='flex items-center'>
                  <input
                    type='checkbox'
                    checked={localFilters.institut.includes(
                      institut as FilterOptions['institut'][number]
                    )}
                    onChange={() => handleFilterChange('institut', institut)}
                    className='mr-2 text-teal-500 focus:ring-teal-500'
                  />
                  <span className='text-sm'>{institut}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <h4 className='font-medium text-gray-900 mb-3'>Date</h4>
            <div className='space-y-2'>
              {['Récente', 'Il y a 3 mois'].map(date => (
                <label key={date} className='flex items-center'>
                  <input
                    type='radio'
                    name='date'
                    checked={localFilters.date === date}
                    onChange={() => handleFilterChange('date', date)}
                    className='mr-2 text-teal-500 focus:ring-teal-500'
                  />
                  <span className='text-sm'>{date}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className='flex space-x-3 mt-6 pt-4 border-t border-gray-200'>
          {/* Annuler closes the modal (onToggle) */}
          <Button variant='outline' onClick={onToggle} className='flex-1'>
            Annuler
          </Button>
          <Button onClick={handleApply} className='flex-1'>
            Confirmer
          </Button>
        </div>
      </div>
    </div>
  );
};
