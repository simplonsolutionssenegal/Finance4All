// components/institutions/FilterDialog.tsx
'use client';

import * as React from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  COUT_OPTIONS,
  EMPTY_FILTERS,
  TYPE_OPTIONS,
  type FilterOptions,
  type TypeService,
} from '@/types/Service';

import BadgeCheckboxGroup from './filters/BadgeCheckboxGroup';
import FilterSection from './filters/FilterSection';

type Props = {
  isOpen: boolean;
  value: FilterOptions;
  onChange: (next: FilterOptions) => void;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  onCancel?: () => void;
};

export default function FilterDialog({
  isOpen,
  value,
  onChange,
  onClose,
  onApply,
  onCancel,
}: Props) {
  const hasFilters = value.type.length > 0 || value.Coût.length > 0;

  const reinit = () => onChange(EMPTY_FILTERS);
  const apply = () => {
    onApply(value);
    onClose();
  };

  const handleClose = () => {
    reinit();
    onClose();
  };
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && handleClose()}>
      <DialogContent aria-label='Filtres des services financiers' className='w-[20em] max-w-[95vw]'>
        <DialogHeader className='flex flex-row items-center justify-between'>
          <DialogTitle className='text-sm'>Type de produit</DialogTitle>
          <button
            type='button'
            onClick={reinit}
            className='text-xs px-1  font-semibold  text-white bg-cyan-400 rounded-md'
            disabled={!hasFilters}
          >
            Réinitialiser
          </button>
        </DialogHeader>

        <div className='p-1 space-y-5'>
          <FilterSection title=''>
            <BadgeCheckboxGroup<TypeService>
              options={TYPE_OPTIONS}
              values={value.type}
              onChange={next => onChange({ ...value, type: next })}
            />
          </FilterSection>
          <FilterSection title='Coût'>
            <BadgeCheckboxGroup<string>
              options={COUT_OPTIONS}
              values={value.Coût}
              onChange={next => onChange({ ...value, Coût: next })}
            />
          </FilterSection>
        </div>

        <DialogFooter className='w-full grid grid-cols-2 gap-2 sm:gap-3'>
          <DialogClose asChild>
            <button
              onClick={() => {
                onChange(EMPTY_FILTERS);
                if (onCancel) onCancel();
                else onClose();
              }}
              className='w-full px-4 py-1 text-xs font-medium text-gray-700 bg-[#8b8e8fff] rounded-md transition-colors'
            >
              Annuler
            </button>
          </DialogClose>

          <button
            onClick={apply}
            className='w-full px-4 py-1 text-xs font-medium text-white bg-green-500 rounded-md transition-colors disabled:opacity-60'
            disabled={!hasFilters}
          >
            Confirmer
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
