'use client';

import { useState, ChangeEvent } from 'react';
import { Filter } from 'lucide-react';
import FilterPopup from '@/components/admin/FilterPopup';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';

interface SearchBarProps {
  onSearch: (value: string) => void;
  resultsCount: number;
  onApplyFilters?: (filters: any) => void;

  rolesOptions?: string[];
  statusesOptions?: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  resultsCount,
  onApplyFilters,
  rolesOptions = [],
  statusesOptions = [],
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [open, setOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch(value);
  };

  
  const handleApplyFilters = (filters: any) => {
    onApplyFilters?.(filters);
    setFilterOpen(false); // fermer le popup après application (sécurité)
  };

  return (
    <div className="bg-white rounded-lg mb-6">
      <h3 className="text-black font-bold mb-2">
        Liste des utilisateurs <span className="text-sm font-normal text-gray-500">({resultsCount})</span>
      </h3>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1 flex gap-3">
          <div className="relative flex-1 max-w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchValue}
              onChange={handleInputChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            onClick={() => setFilterOpen(true)}
            type="button"
            className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 flex items-center transition-colors duration-200"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtrer
          </button>
        </div>

        {/* (Optionnel) ton bouton d'ajout utilisateur / Dialog */}
        <div>
              <button
               
                type="button"
                className="w-full md:w-auto bg-[#6CB9C6] hover:bg-[#5AA7B3] text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Ajouter un utilisateur
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
