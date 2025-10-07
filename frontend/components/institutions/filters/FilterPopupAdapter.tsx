// FilterPopupAdapter.tsx
import React, { useEffect, useState } from 'react';

import type { FilterOptions } from '@/types/FilterOptions';

import FilterPopup from '../FilterPopup';

import { EMPTY_FILTERS } from './options';

export default function FilterPopupAdapter({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters,
}: {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}) {
  const [value, setValue] = useState<FilterOptions>(EMPTY_FILTERS);

  useEffect(() => {
    if (isOpen) {
      setValue(currentFilters ?? EMPTY_FILTERS);
    }
  }, [isOpen, currentFilters]);
  return (
    <FilterPopup
      isOpen={isOpen}
      value={value}
      onChange={setValue}
      onClose={onClose}
      onApply={f => {
        onApplyFilters(f);
        onClose();
      }}
      onCancel={() => {
        setValue(EMPTY_FILTERS);
        onApplyFilters(EMPTY_FILTERS);
        onClose();
      }}
    />
  );
}
