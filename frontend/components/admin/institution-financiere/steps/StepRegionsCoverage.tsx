import { Check } from 'lucide-react';
import React from 'react';
import type { UseFormReturn } from 'react-hook-form';

import { Badge } from '@/components/ui/badge';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

import { regions } from '../constants';
import type { InstitutionFormValues } from '../validation-schema';

interface StepRegionsCoverageProps {
  form: UseFormReturn<InstitutionFormValues>;
  selectedRegions: string[];
  toggleRegion: (region: string) => void;
}

export const StepRegionsCoverage: React.FC<StepRegionsCoverageProps> = ({ form, selectedRegions, toggleRegion }) => {
  return (
    <div className='space-y-5'>
      <div className='mb-4'>
        <h3 className='text-lg font-semibold text-gray-800'>Couverture géographique</h3>
        <p className='text-sm text-gray-500 mt-1'>Sélectionnez les régions couvertes par cette institution</p>
      </div>
      <FormField
        control={form.control}
        name='regionsDesservies'
        render={() => (
          <FormItem>
            <FormLabel className='text-sm font-medium text-gray-700 mb-2'>Régions sélectionnées</FormLabel>
            <div className='flex flex-wrap gap-2 mb-4'>
              {selectedRegions.length === 0 && (
                <span className='text-xs text-gray-400'>Aucune région sélectionnée</span>
              )}
              {selectedRegions.map(region => {
                const regionLabel = regions.find(r => r.value === region)?.label ?? region;
                return (
                  <Badge key={region} className='rounded-full py-1.5 px-3 bg-teal-50 text-teal-700 hover:bg-teal-100 border-0'>
                    {regionLabel}
                    <button type='button' className='ml-1.5 text-teal-500 hover:text-teal-700 focus:outline-none' onClick={() => toggleRegion(region)}>
                      ✕
                    </button>
                  </Badge>
                );
              })}
            </div>
            <FormControl>
              <div className='grid grid-cols-2 gap-3'>
                {regions.map(r => {
                  const isSelected = selectedRegions.includes(r.value);
                  return (
                    <button
                      type='button'
                      key={r.value}
                      onClick={() => toggleRegion(r.value)}
                      aria-pressed={isSelected}
                      className={`p-3 rounded-lg border cursor-pointer transition-all text-left ${isSelected ? 'bg-teal-50 border-teal-300' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className='flex items-center'>
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center border ${isSelected ? 'border-teal-500 bg-teal-500' : 'border-gray-300'}`}
                          aria-hidden='true'
                        >
                          {isSelected && <Check className='w-3 h-3 text-white' />}
                        </span>
                        <span className={`ml-2 text-sm ${isSelected ? 'font-medium text-teal-700' : 'text-gray-700'}`}>{r.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </FormControl>
            <FormMessage className='text-red-500 text-xs mt-2' />
          </FormItem>
        )}
      />
    </div>
  );
};

export default StepRegionsCoverage;
