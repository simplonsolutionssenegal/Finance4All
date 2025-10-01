'use client';

import { Check as CheckIcon } from 'lucide-react';
import React, { useState } from 'react';

export interface ServiceFilterOptions {
  type: string[];
  zone: string[];
  date: '' | 'recent' | '3mois'; // 👈 correspond à l’UI et à ton backend (3mois)
}

interface FilterPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: ServiceFilterOptions) => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <fieldset className='mb-4'>
    <legend className='text-sm font-bold text-black mt-2'>{title}</legend>
    {/* Ligne pleine largeur */}
    <div className='mt-2 mb-3 h-px bg-[#EAEAEA] w-full' />
    {children}
  </fieldset>
);

type ChipProps = {
  label: string;
  checked: boolean;
  onToggle: () => void;
  inputType: 'checkbox' | 'radio';
  name?: string;
  value?: string;
};

const Chip: React.FC<ChipProps> = ({ label, checked, onToggle, inputType, name, value }) => (
  <label
    className={`inline-flex items-center rounded-full border px-1 py-1 cursor-pointer select-none transition
      ${checked ? 'bg-green-50 border-green-600' : 'bg-gray-100 border-gray-200'}`}
  >
    <input
      type={inputType}
      name={name}
      value={value}
      checked={checked}
      onChange={onToggle}
      className='peer sr-only'
    />
    <span
      className={`mr-2 h-3 w-3 rounded-full border flex items-center justify-center
        ${checked ? 'bg-green-600 border-green-600' : 'bg-white border-gray-300'}`}
    >
      <CheckIcon
        className={`h-2.5 w-2.5 ${checked ? 'text-white' : 'text-transparent'}`}
        strokeWidth={3}
      />
    </span>
    <span className={`text-xs leading-none ${checked ? 'text-gray-900' : 'text-gray-700'}`}>
      {label}
    </span>
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
    <div className='flex flex-wrap gap-2'>
      {options.map(opt => (
        <Chip
          key={opt.value}
          label={opt.label}
          checked={values.includes(opt.value)}
          onToggle={() => toggle(opt.value)}
          inputType='checkbox'
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
    <div className='flex flex-wrap gap-2'>
      {options.map(opt => (
        <Chip
          key={opt.value}
          label={opt.label}
          checked={value === opt.value}
          onToggle={() => onChange(opt.value)}
          inputType='radio'
          name={name}
          value={opt.value}
        />
      ))}
    </div>
  );
}

const FilterPopup: React.FC<FilterPopupProps> = ({ isOpen, onClose, onApplyFilters }) => {
  const [filters, setFilters] = useState<ServiceFilterOptions>({
    type: [],
    zone: [],
    date: '',
  });

  // Options (texte = maquette, valeurs = API)
  const typeOptions = [
    { value: 'EPARGNE', label: 'Epargne' },
    { value: 'CREDIT', label: 'Crédit' },
    { value: 'AUTRE', label: 'Autre type' },
  ] as const;

  const zoneOptions = [
    { value: '1', label: 'Zone Géo A' },
    { value: '2', label: 'Zone Géo B' },
  ] as const;

  const dateOptions = [
    { value: 'recent', label: 'Récente' },
    { value: '3mois', label: 'Il y a 3 mois' },
  ] as const;

  // Actions
  const handleApply = () => {
    const hasFilters = filters.type.length > 0 || filters.zone.length > 0 || filters.date !== '';
    if (!hasFilters) {
      alert('Veuillez sélectionner au moins un filtre (type, zone ou date).');
      return;
    }
    onApplyFilters(filters);
    onClose();
  };

  const emptyFilters: ServiceFilterOptions = { type: [], zone: [], date: '' };

  const handleReinit = () => {
    // Réinitialiser (ne pas fermer)
    setFilters(emptyFilters);
    onApplyFilters(emptyFilters);
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/20 flex items-center justify-center z-50'>
      <div className='bg-white rounded-xl shadow-xl w-full max-w-64 mx-2'>
        {/* Header avec “Reinstaller” */}
        <div className='px-4 pt-4 flex items-center justify-between'>
          <span className='text-sm font-semibold text-black'>Type de produit</span>
          <button
            type='button'
            onClick={handleReinit}
            className='text-xs font-semibold text-orange-500 hover:underline'
          >
            Réinitialiser
          </button>
        </div>

        <div className='p-2 space-y-5'>
          {/* Type de produit */}
          <Section title=''>
            <ChipCheckboxGroup
              options={typeOptions}
              values={filters.type}
              onChange={next => setFilters(prev => ({ ...prev, type: next }))}
            />
          </Section>

          {/* Zone géographique */}
          <Section title='Zone géographique'>
            <ChipCheckboxGroup
              options={zoneOptions}
              values={filters.zone}
              onChange={next => setFilters(prev => ({ ...prev, zone: next }))}
            />
          </Section>

          {/* Date */}
          <Section title='Date'>
            <ChipRadioGroup
              name='date'
              options={dateOptions}
              value={filters.date}
              onChange={next => setFilters(prev => ({ ...prev, date: next }))}
            />
          </Section>
        </div>

        <div className='flex items-center justify-between p-2 w-full mb-3 gap-3'>
          <button
            onClick={() => {
              setFilters(emptyFilters);
              onApplyFilters(emptyFilters);
              onClose(); // fermer
            }}
            className='px-4 py-1 w-sm text-xs font-medium text-gray-700 bg-[#8b8e8fff] hover:bg-[#8b8e8fff] rounded-md transition-colors'
          >
            Annuler
          </button>
          <button
            onClick={handleApply}
            className='px-4 py-1 w-sm text-xs font-medium text-white bg-green-500 rounded-md transition-colors'
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPopup;
