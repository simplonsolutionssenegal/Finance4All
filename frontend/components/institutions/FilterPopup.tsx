'use client';

import React from 'react';

import type { FilterOptions, DateFilter } from '@/types/FilterOptions';
import type { ProductType } from '@/types/ProductType';

import BadgeCheckboxGroup from './filters/BadgeCheckboxGroup';
import BadgeRadioGroup from './filters/BadgeRadioGroup';
import FilterSection from './filters/FilterSection';
import { DATE_OPTIONS, EMPTY_FILTERS, TYPE_OPTIONS, ZONE_OPTIONS } from './filters/options';

type Props = {
  isOpen: boolean;
  value: FilterOptions; // contrôlé
  onChange: (next: FilterOptions) => void;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  onCancel?: () => void;
};

export default function FilterPopup({
  isOpen,
  value,
  onChange,
  onClose,
  onApply,
  onCancel,
}: Props) {
  if (!isOpen) return null;

  const hasFilters = value.type.length > 0 || value.zone.length > 0 || value.date !== '';

  const apply = () => {
    onApply(value);
    onClose();
  };

  const reinit = () => onChange(EMPTY_FILTERS);

  return (
    <div
      className='fixed inset-0 bg-black/20 flex items-center justify-center z-50'
      role='dialog'
      aria-modal='true'
      aria-label='Filtres des produits financiers'
    >
      <div className='bg-white rounded-xl shadow-xl w-full max-w-64 mx-2'>
        <div className='px-4 pt-4 flex items-center justify-between'>
          <span className='text-sm font-semibold text-black'>Type de produit</span>
          <button
            type='button'
            onClick={reinit}
            className='text-xs font-semibold text-orange-500 hover:underline'
          >
            Réinitialiser
          </button>
        </div>

        <div className='p-2 space-y-5'>
          <FilterSection title=''>
            <BadgeCheckboxGroup<ProductType>
              options={TYPE_OPTIONS}
              values={value.type}
              onChange={next => onChange({ ...value, type: next })}
            />
          </FilterSection>

          <FilterSection title='Zone géographique'>
            <BadgeCheckboxGroup<string>
              options={ZONE_OPTIONS}
              values={value.zone}
              onChange={next => onChange({ ...value, zone: next })}
            />
          </FilterSection>

          <FilterSection title='Date'>
            <BadgeRadioGroup<DateFilter>
              name='date'
              options={DATE_OPTIONS}
              value={value.date}
              onChange={next => onChange({ ...value, date: next })}
            />
          </FilterSection>
        </div>

        <div className='flex items-center justify-between p-2 w-full mb-3 gap-3'>
          <button
            onClick={() => {
              onChange(EMPTY_FILTERS);
              if (onCancel) onCancel();
              else onClose();
            }}
            className='px-4 py-1 w-sm text-xs font-medium text-gray-700 bg-[#8b8e8fff] rounded-md transition-colors'
          >
            Annuler
          </button>
          <button
            onClick={apply}
            className='px-4 py-1 w-sm text-xs font-medium text-white bg-green-500 rounded-md transition-colors disabled:opacity-60'
            disabled={!hasFilters}
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}
