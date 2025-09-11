// frontend/components/admin/SearchBar.tsx
"use client";

import type { ChangeEvent } from "react";
// eslint-disable-next-line no-duplicate-imports
import { useState } from "react";

import UserCreationForm from "@/components/admin/UserCreationForm";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
} from "@/components/ui/dialog";

import UserFilter, { type UserFilters } from "./UserFilter";


interface SearchBarProps {
  onSearch: (value: string) => void;
  resultsCount: number;
  onFiltersChange: (filters: UserFilters) => void;
  currentFilters: UserFilters;
  onResetFilters?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  resultsCount,
  onFiltersChange,
  currentFilters,
  onResetFilters
}) => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch(value);
  };

  const handleResetAll = () => {
    setSearchValue("");
    onSearch("");
    if (onResetFilters) {
      onResetFilters();
    }
  };

  const hasActiveFilters = 
    currentFilters.status.length > 0 ||
    currentFilters.roleId.length > 0 ||
    currentFilters.organizationId.length > 0 ||
    (currentFilters.dateRange && currentFilters.dateRange !== "recent") ||
    !!currentFilters.customDate ||
    searchValue.length > 0;

  return (
    <div className="bg-white mt-8 mb-8">
      <h6 className="text-xl font-bold text-black-900 mr-4 mb-2">Liste des utilisateurs</h6>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Champ de recherche */}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchValue}
                onChange={handleInputChange}
                className="block w-full h-11 pl-10 pr-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Bouton Filtrer */}
            <UserFilter
              onFiltersChange={onFiltersChange}
              currentFilters={currentFilters}
            />
            
            {/* Bouton Réinitialiser tout - visible seulement s'il y a des filtres actifs */}
            {hasActiveFilters && (
              <button
                onClick={handleResetAll}
                type="button"
                className="inline-flex items-center h-11 px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Tout effacer
              </button>
            )}
          </div>
          {searchValue && (
            <p className="text-sm text-gray-600 mt-2">
              {resultsCount} résultat(s) trouvé(s)
            </p>
          )}
        </div>

        {/* Bouton filtre */}

        {/* Bouton + Dialog */}
        <div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button
                onClick={() => setOpen(true)}
                type="button"
                className="w-full md:w-auto bg-[#6CB9C6] hover:bg-[#5AA7B3] text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Ajouter un utilisateur
              </button>
            </DialogTrigger>
            <DialogContent>
              <UserCreationForm onUserCreated={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;