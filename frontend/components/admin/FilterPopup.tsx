'use client';

import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

export interface FilterOptions {
  role: string[];                         // ex: ['admin','developpeur', ...] (lowercase à l'apply)
  lastConnection: '' | 'recent' | 'month' | 'custom';
  customDate: string;                     // 'YYYY-MM-DD' si lastConnection === 'custom'
  status: string[];                       // ex: ['ACTIF','EN_ATTENTE'] (UPPERCASE à l'apply)
}

interface FilterPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
}

const FilterPopup: React.FC<FilterPopupProps> = ({ isOpen, onClose, onApplyFilters }) => {
  const [filters, setFilters] = useState<FilterOptions>({
    role: [],
    lastConnection: '',
    customDate: '',
    status: [],
  });

  // ✅ Options mises à jour pour correspondre au backend
  const roleOptions = [
    { value: 'admin',         label: 'Admin' },
    { value: 'super_admin',   label: 'Super Admin' },
    { value: 'autre',         label: 'Autre' },
    { value: 'developpeur',   label: 'Développeur' },
    { value: 'collaborateur', label: 'Collaborateur' },
    // { value: 'comptable',     label: 'Comptable' },
  ];

  const lastConnectionOptions = [
    { value: 'recent' as const, label: 'Plus récent' },
    { value: 'month'  as const, label: 'Il y a un mois' },
    { value: 'custom' as const, label: 'Choisir une date' },
  ];

  const statusOptions = [
    { value: 'ACTIF',      label: 'Actif' },       
    { value: 'INACTIF',    label: 'Inactif' },
    { value: 'EN_ATTENTE', label: 'En attente' },  
  ];

  const toggleInArray = (arr: string[], v: string) =>
    arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];

  const handleRoleChange = (roleValue: string) =>
    setFilters(prev => ({ ...prev, role: toggleInArray(prev.role, roleValue) }));

  const handleStatusChange = (statusValue: string) =>
    setFilters(prev => ({ ...prev, status: toggleInArray(prev.status, statusValue) }));

  const handleLastConnectionChange = (value: FilterOptions['lastConnection']) =>
    setFilters(prev => ({
      ...prev,
      lastConnection: value,
      customDate: value === 'custom' ? prev.customDate : '',
    }));

  const handleApply = () => {
    // Validation: au moins un filtre doit être sélectionné
    const hasFilters = filters.role.length > 0 || 
                      filters.status.length > 0 || 
                      filters.lastConnection !== '';

    if (!hasFilters) {
      alert('Veuillez sélectionner au moins un filtre (statut, rôle ou date de connexion).');
      return;
    }

    // Validation pour la date custom
    if (filters.lastConnection === 'custom' && !filters.customDate) {
      alert('Veuillez sélectionner une date pour le filtre personnalisé.');
      return;
    }
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    const reset = { role: [], lastConnection: '', customDate: '', status: [] } as FilterOptions;
    setFilters(reset);
    onApplyFilters(reset);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xs mx-4">
        <div className="p-3 space-y-6">
          <div>
            <label className="block text-sm font-bold text-black mt-2 mb-3 border-b border-b-[#EAEAEA]">
              Rôle
            </label>

            <div className="flex flex-wrap gap-2 ">
              {roleOptions.map((option) => {
                const checked = filters.role.includes(option.value);
                return (
                  <label
                    key={option.value}
                    className={`inline-flex items-center rounded-full border px-1 py-0.5 cursor-pointer select-none transition
      ${checked ? 'bg-green-50 border-green-600' : 'bg-gray-100 border-gray-200'}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleRoleChange(option.value)}
                      className="peer sr-only"
                    />

                    <span
                      className={`relative mr-1.5 h-4 w-4 rounded-full border flex items-center justify-center
        ${checked ? 'bg-green-600 border-green-600' : 'bg-white border-gray-300'}`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className={`h-2.5 w-2.5 ${checked ? 'text-white' : 'text-transparent'}`}
                        fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>

                    <span className={`text-xs leading-none ${checked ? 'text-gray-900' : 'text-gray-700'}`}>
                      {option.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Last Connection Filter */}
          <div>
            <label className="block text-sm font-bold text-black mt-2 mb-3 border-b border-b-[#EAEAEA]">
              Dernière connexion
            </label>
            <div className="flex flex-wrap gap-2">
              {lastConnectionOptions.map((option) => {
                const checked = filters.lastConnection === option.value;
                return (
                  <label
                    key={option.value}
                    className={`inline-flex items-center rounded-full border px-1 py-0.5 cursor-pointer select-none transition
      ${checked ? 'bg-green-50 border-green-600' : 'bg-gray-100 border-gray-200'}`}
                  >
                    <input
                      type="radio"
                      name="lastConnection"
                      value={option.value}
                      checked={checked}
                      onChange={(e) => handleLastConnectionChange(e.target.value as FilterOptions['lastConnection'])}
                      className="peer sr-only"
                    />
                    <span
                      className={`mr-1.5 h-4 w-4 rounded-full border flex items-center justify-center
        ${checked ? 'bg-green-600 border-green-600' : 'bg-white border-gray-300'}`}
                    >
                      <svg viewBox="0 0 24 24" className={`h-2.5 w-2.5 ${checked ? 'text-white' : 'text-transparent'}`} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    <span className={`text-xs leading-none ${checked ? 'text-gray-900' : 'text-gray-700'}`}>
                      {option.label}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Custom Date Input */}
            {filters.lastConnection === 'custom' && (
              <div className="mt-3">
                <div className="relative">
                  <input
                    type="date"
                    value={filters.customDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, customDate: e.target.value }))}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
            )}
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-bold text-black mt-2 mb-3 border-b border-b-[#EAEAEA]">
              Statut
            </label>
            <div className="flex flex-wrap gap-1.5">
              {statusOptions.map((option) => {
                const checked = filters.status.includes(option.value);
                return (
                  <label
                    key={option.value}
                    className={`inline-flex items-center rounded-full border px-1 py-0.5 cursor-pointer select-none transition
      ${checked ? 'bg-green-50 border-green-600' : 'bg-gray-100 border-gray-200'}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleStatusChange(option.value)}
                      className="peer sr-only"
                    />

                    <span
                      className={`mr-1.5 h-4 w-4 rounded-full border flex items-center justify-center
        ${checked ? 'bg-green-600 border-green-600' : 'bg-white border-gray-300'}`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className={`h-2.5 w-2.5 ${checked ? 'text-white' : 'text-transparent'}`}
                        fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>

                    <span className={`text-xs leading-none ${checked ? 'text-gray-900' : 'text-gray-700'}`}>
                      {option.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-2 w-full mb-3 gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-1 w-sm text-xs font-medium text-gray-700 bg-[#8b8e8fff] hover:bg-[#8b8e8fff] rounded-md transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-1 w-sm text-xs font-medium text-white bg-green-500 rounded-md transition-colors"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPopup;