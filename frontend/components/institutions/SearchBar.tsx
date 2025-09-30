'use client';

import { Filter, Search } from 'lucide-react';
import React, { useState, type ChangeEvent, useRef, useEffect } from 'react';

import { Input } from '@/components/ui/input';
import { useSearchStore } from '@/hooks/useSearchStore';
import type { FilterOptions } from '@/types/FilterOptions';

import FilterPopup from './FilterPopup';

interface SearchBarProps {
  onSearch: (value: string) => void;
  resultsCount: number;
  onApplyFilters?: (filters: FilterOptions) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, resultsCount, onApplyFilters }) => {
  const [searchValue, setSearchValue] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // store Zustand pour garder l'historique
  const recentSearches = useSearchStore(state => state.recentSearches);
  const addSearch = useSearchStore(state => state.addSearch);

  // fermer dropdown si clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch(value); // déclenche la recherche "live"
    setShowDropdown(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchValue.trim() !== '') {
      addSearch(searchValue.trim()); // ajoute une seule fois
      setShowDropdown(false);
    }
  };

  const handleSelectSearch = (value: string) => {
    setSearchValue(value);
    onSearch(value);
    addSearch(value); // ajouter aussi si on choisit un ancien terme
    setShowDropdown(false);
  };

  const handleApplyFilters = (filters: FilterOptions) => {
    onApplyFilters?.(filters);
    setFilterOpen(false);
  };

  return (
    <div className='bg-white rounded-lg mb-6 mt-6'>
      <h3 className='text-black font-bold mb-2'>Services financiers ({resultsCount}) </h3>

      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <div className='flex-1 flex gap-3'>
          {/* Input + dropdown */}
          <div ref={containerRef} className='relative flex-1 max-w-64'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
            <Input
              type='text'
              placeholder='Rechercher un service...'
              value={searchValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown} // ⬅️ nouveau
              onFocus={() => setShowDropdown(true)}
              className='pl-10 pr-4 py-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent'
            />

            {/* Dropdown des 3 dernières recherches */}
            {/* Dropdown des 3 dernières recherches */}
            {showDropdown && recentSearches.length > 0 && (
              <ul
                className='absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-auto'
                aria-label='Recherches récentes' // ← on peut garder ce label
              >
                {recentSearches.map(s => (
                  <li key={s}>
                    <button
                      type='button'
                      onClick={() => handleSelectSearch(s)}
                      className='w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none'
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Bouton Filtrer */}
          <button
            onClick={() => setFilterOpen(true)}
            type='button'
            className='bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-md flex items-center'
          >
            <Filter className='w-4 h-4 mr-2' />
            Filtrer
          </button>
        </div>
      </div>

      {/* Popup de filtres */}
      <FilterPopup
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
};

export default SearchBar;
