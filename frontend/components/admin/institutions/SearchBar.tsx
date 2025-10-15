'use client';

import { Filter, Search } from 'lucide-react';
import React, { useState, useEffect, type ChangeEvent } from 'react';

import { Input } from '@/components/ui/input';
import { type FilterOptions, EMPTY_FILTERS } from '@/types/Service';

import FilterPopup from './FilterPopup';

interface SearchBarProps {
  onSearch: (value: string) => void;
  resultsCount: number;
  onApplyFilters?: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  resultsCount,
  onApplyFilters,
  currentFilters,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterValue, setFilterValue] = useState<FilterOptions>(EMPTY_FILTERS);

  useEffect(() => {
    if (filterOpen) {
      setFilterValue(currentFilters ?? EMPTY_FILTERS);
    }
  }, [filterOpen, currentFilters]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch(value);
  };

  const handleApplyFilters = (filters: FilterOptions) => {
    onApplyFilters?.(filters);
    setFilterOpen(false);
  };

  const handleCancelFilters = () => {
    setFilterValue(EMPTY_FILTERS);
    onApplyFilters?.(EMPTY_FILTERS);
    setFilterOpen(false);
  };

  return (
    <div className='bg-white rounded-lg '>
      <h3 className='text-black font-bold mb-2'>Services financiers ({resultsCount}) </h3>

      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <div className='flex-1 flex gap-3'>
          <div className='relative flex-1 max-w-64'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
            <Input
              type='text'
              placeholder='Rechercher un service...'
              value={searchValue}
              onChange={handleInputChange}
              className='pl-10 pr-4 py-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent'
            />
          </div>
          <button
            onClick={() => setFilterOpen(true)}
            type='button'
            className='h-9 bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-md flex items-center'
          >
            <Filter className='w-4 h-4 mr-2' />
            Filtrer
          </button>
        </div>
      </div>
      <FilterPopup
        isOpen={filterOpen}
        value={filterValue}
        onChange={setFilterValue}
        onClose={() => setFilterOpen(false)}
        onApply={handleApplyFilters}
        onCancel={handleCancelFilters}
      />
    </div>
  );
};

export default SearchBar;
