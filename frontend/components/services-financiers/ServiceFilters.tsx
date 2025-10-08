import { X, Check } from 'lucide-react';
import React, { useEffect, useState } from 'react';

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
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (category: keyof FilterOptions, value: string) => {
    if (category === 'date') {
      setLocalFilters(prev => ({ ...prev, [category]: value as FilterOptions['date'] }));
      return;
    }

    const currentValues = localFilters[category] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];

    setLocalFilters(prev => ({ ...prev, [category]: newValues }));
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
    onToggle();
  };

  const defaultFilters: FilterOptions = {
    serviceType: [],
    geographicZone: [],
    institut: [],
    date: 'Récente',
  };

  const handleResetLocal = () => {
    setLocalFilters(defaultFilters);
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/60 flex items-center justify-center z-50'>
      <div className='bg-white rounded-2xl p-6 w-[400px] max-h-[90vh] overflow-y-auto shadow-2xl'>
        <div className='flex items-start justify-between mb-4'>
          <div>
            <h3 className='text-base font-semibold text-gray-900'>Filtres</h3>
            <p className='text-xs text-gray-500'>Affinez les résultats</p>
          </div>
          <button
            onClick={onToggle}
            tabIndex={-1}
            className='text-gray-400 hover:text-gray-600'
            aria-label='Fermer'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        <div className='space-y-6'>
          <div>
            <div className='flex justify-between items-center mb-4'>
              <h4 className='font-semibold text-gray-900 text-base'>Type de produit</h4>
              <button
                onClick={handleResetLocal}
                tabIndex={-1}
                className='text-yellow-600 text-sm font-medium hover:underline'
              >
                Réinstaller
              </button>
            </div>

            <div className='flex flex-wrap gap-2'>
              {['Epargne', 'Crédit', 'Autre type'].map(type => {
                const isSelected = localFilters.serviceType.includes(type as any);
                return (
                  <label
                    key={type}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md border-2 font-medium text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <input
                      type='checkbox'
                      className='sr-only'
                      checked={isSelected}
                      onChange={() => handleFilterChange('serviceType', type)}
                    />
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-green-600' : 'border-2 border-gray-300'}`}
                    >
                      {isSelected && <Check className='w-2.5 h-2.5 text-white stroke-[2]' />}
                    </div>
                    <span className='text-gray-700 text-xs'>{type}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className='font-semibold text-gray-900 text-base mb-4'>Zone géographique</h4>
            <div className='flex flex-wrap gap-2'>
              {['Zone Géo A', 'Zone Géo B'].map(zone => {
                const isSelected = localFilters.geographicZone.includes(zone as any);
                return (
                  <label
                    key={zone}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md border-2 font-medium text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <input
                      type='checkbox'
                      className='sr-only'
                      checked={isSelected}
                      onChange={() => handleFilterChange('geographicZone', zone)}
                    />
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-green-600' : 'border-2 border-gray-300'}`}
                    >
                      {isSelected && <Check className='w-2.5 h-2.5 text-white stroke-[2]' />}
                    </div>
                    <span className='text-gray-700 text-xs'>{zone}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className='font-semibold text-gray-900 text-base mb-4'>Institut</h4>
            <div className='flex flex-wrap gap-2'>
              {['SIMPLON', 'PAYTECH SN', 'ODK'].map(institut => {
                const isSelected = localFilters.institut.includes(institut as any);
                return (
                  <label
                    key={institut}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md border-2 font-medium text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <input
                      type='checkbox'
                      className='sr-only'
                      checked={isSelected}
                      onChange={() => handleFilterChange('institut', institut)}
                    />
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-green-600' : 'border-2 border-gray-300'}`}
                    >
                      {isSelected && <Check className='w-2.5 h-2.5 text-white stroke-[2]' />}
                    </div>
                    <span className='text-gray-700 text-xs'>{institut}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className='font-semibold text-gray-900 text-base mb-4'>Date</h4>
            <div className='flex flex-wrap gap-2'>
              {['Récente', 'Il y a 3 mois'].map(date => {
                const isSelected = localFilters.date === date;
                return (
                  <label
                    key={date}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md border-2 font-medium text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <input
                      type='radio'
                      name='date'
                      className='sr-only'
                      checked={isSelected}
                      onChange={() => handleFilterChange('date', date)}
                    />
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-green-600' : 'border-2 border-gray-300'}`}
                    >
                      {isSelected && <Check className='w-2.5 h-2.5 text-white stroke-[2]' />}
                    </div>
                    <span className='text-gray-700 text-xs'>{date}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className='flex gap-3 mt-6 pt-4'>
          <Button variant='outline' onClick={handleReset} className='flex-1 py-2 text-sm'>
            Annuler
          </Button>
          <Button
            onClick={handleApply}
            className='flex-1 py-2 text-sm'
            style={{ backgroundColor: 'var(--primary-300)', color: 'white' }}
          >
            Confirmer
          </Button>
        </div>
      </div>
    </div>
  );
};
