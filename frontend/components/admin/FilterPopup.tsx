'use client';

import { Calendar, Check as CheckIcon } from 'lucide-react';
import React, { useState } from 'react';

export interface FilterOptions {
  role: string[];
  lastConnection: '' | 'recent' | 'month' | 'custom';
  customDate: string;
  status: string[];
}

interface FilterPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
}

/* ---------- Petits composants factorisés ---------- */

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <fieldset className="mb-4">
    <legend className="block text-sm font-bold text-black mt-2 mb-3 border-b border-b-[#EAEAEA]">
      {title}
    </legend>
    {children}
  </fieldset>
);

type ChipProps = {
  label: string;
  checked: boolean;
  onToggle: () => void;
  inputType: 'checkbox' | 'radio';
  name?: string;       // requis pour radio
  value?: string;      // requis pour radio
};

const Chip: React.FC<ChipProps> = ({ label, checked, onToggle, inputType, name, value }) => (
  <label
    className={`inline-flex items-center rounded-full border px-1 py-0.5 cursor-pointer select-none transition
      ${checked ? 'bg-green-50 border-green-600' : 'bg-gray-100 border-gray-200'}`}
  >
    <input
      type={inputType}
      name={name}
      value={value}
      checked={checked}
      onChange={onToggle}
      className="peer sr-only"
    />
    <span
      className={`mr-1.5 h-4 w-4 rounded-full border flex items-center justify-center
        ${checked ? 'bg-green-600 border-green-600' : 'bg-white border-gray-300'}`}
    >
      {/* Icône de validation */}
      <CheckIcon className={`h-2.5 w-2.5 ${checked ? 'text-white' : 'text-transparent'}`} strokeWidth={3} />
    </span>
    <span className={`text-xs leading-none ${checked ? 'text-gray-900' : 'text-gray-700'}`}>{label}</span>
  </label>
);

type Option<T extends string> = { value: T; label: string };

function ChipCheckboxGroup<T extends string>(props: {
  options: ReadonlyArray<Option<T>>;
  values: ReadonlyArray<T>;
  onChange: (nextValues: T[]) => void;
}) {
  const { options, values, onChange } = props;
  const toggle = (v: T) => {
    const next = values.includes(v) ? values.filter(x => x !== v) : [...values, v];
    onChange(next as T[]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <Chip
          key={opt.value}
          label={opt.label}
          checked={values.includes(opt.value)}
          onToggle={() => toggle(opt.value)}
          inputType="checkbox"
        />
      ))}
    </div>
  );
}



function ChipRadioGroup<T extends string>(props: {
  name: string;
  options: ReadonlyArray<Option<T>>;
  value: T | '';
  onChange: (next: T) => void;
}) {
  const { name, options, value, onChange } = props;
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <Chip
          key={opt.value}
          label={opt.label}
          checked={value === opt.value}
          onToggle={() => onChange(opt.value)}
          inputType="radio"
          name={name}
          value={opt.value}
        />
      ))}
    </div>
  );
}

/* ---------- Composant principal ---------- */

const FilterPopup: React.FC<FilterPopupProps> = ({ isOpen, onClose, onApplyFilters }) => {
  const [filters, setFilters] = useState<FilterOptions>({
    role: [],
    lastConnection: '',
    customDate: '',
    status: [],
  });

  // Options
  const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'autre', label: 'Autre' },
    { value: 'developpeur', label: 'Développeur' },
    { value: 'collaborateur', label: 'Collaborateur' },
  ] as const;

  const lastConnectionOptions = [
    { value: 'recent', label: 'Plus récent' },
    { value: 'month', label: 'Il y a un mois' },
    { value: 'custom', label: 'Choisir une date' },
  ] as const;

  const statusOptions = [
    { value: 'ACTIF', label: 'Actif' },
    { value: 'INACTIF', label: 'Inactif' },
    { value: 'EN_ATTENTE', label: 'En attente' },
  ] as const;

  // Handlers
  const handleApply = () => {
    const hasFilters =
      filters.role.length > 0 || filters.status.length > 0 || filters.lastConnection !== '';

    if (!hasFilters) {
      alert('Veuillez sélectionner au moins un filtre (statut, rôle ou date de connexion).');
      return;
    }

    if (filters.lastConnection === 'custom' && !filters.customDate) {
      alert('Veuillez sélectionner une date pour le filtre personnalisé.');
      return;
    }

    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    const reset: FilterOptions = { role: [], lastConnection: '', customDate: '', status: [] };
    setFilters(reset);
    onApplyFilters(reset);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xs mx-4">
        <div className="p-3 space-y-6">
          {/* Rôle */}
          <Section title="Rôle">
            <ChipCheckboxGroup
              options={roleOptions}
              values={filters.role}
              onChange={(next) => setFilters((prev) => ({ ...prev, role: next }))}
            />
          </Section>

          {/* Dernière connexion */}
          <Section title="Dernière connexion">
            <ChipRadioGroup
              name="lastConnection"
              options={lastConnectionOptions}
              value={filters.lastConnection}
              onChange={(next) =>
                setFilters((prev) => ({
                  ...prev,
                  lastConnection: next as FilterOptions['lastConnection'],
                  customDate: next === 'custom' ? prev.customDate : '',
                }))
              }
            />

            {filters.lastConnection === 'custom' && (
              <div className="mt-3">
                <div className="relative">
                  <input
                    type="date"
                    value={filters.customDate}
                    onChange={(e) => setFilters((prev) => ({ ...prev, customDate: e.target.value }))}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
            )}
          </Section>

          {/* Statut */}
          <Section title="Statut">
            <ChipCheckboxGroup
              options={statusOptions}
              values={filters.status}
              onChange={(next) => setFilters((prev) => ({ ...prev, status: next }))}
            />
          </Section>
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
