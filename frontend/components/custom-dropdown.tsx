'use client';

import { ChevronDown, Check } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';

import { Input } from '@/components/ui/input';
import type { CustomDropdownProps, DropdownOption, IconType } from '@/lib/dropdown-types';
import { filterDropdownOptions } from '@/lib/dropdown-utils';

const renderIcon = (icon: IconType | undefined, className = '') => {
  if (!icon) return null;

  // Si c'est une string, on considère que c'est une URL d'image
  if (typeof icon === 'string') {
    return (
      <Image
        src={icon}
        alt='Icon'
        width={30}
        height={30}
        className={`object-contain ${className}`}
      />
    );
  }

  // Sinon, c'est un ReactNode (composant d'icône)
  return <>{icon}</>;
};

export function CustomDropdown<T = unknown>({
  options,
  selected,
  onSelect,
  placeholder,
  icon,
  searchable = false,
  disabled = false,
  className = '',
  emptyMessage = 'Aucun résultat trouvé',
  maxHeight = 'max-h-80',
}: Readonly<CustomDropdownProps<T>>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = filterDropdownOptions(options, searchTerm);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: DropdownOption<T>) => {
    if (option.disabled) return;
    onSelect(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between p-4 bg-gray-50 border-2 border-gray-300 rounded-xl text-gray-900 hover:bg-gray-100 hover:border-teal-500 transition-all duration-300 shadow-lg ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        <div className='flex items-center gap-3'>
          {renderIcon(icon)}
          <span className={`font-medium ${selected ? 'text-gray-900' : 'text-gray-500'}`}>
            {selected ? selected.name : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          } ${disabled ? 'opacity-50' : ''}`}
        />
      </button>

      {isOpen && !disabled && (
        <div
          className={`absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-[99999] ${maxHeight} overflow-hidden`}
        >
          {searchable && (
            <div className='p-3 border-b border-gray-100'>
              <Input
                type='text'
                placeholder='Rechercher...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500'
              />
            </div>
          )}
          <div className='max-h-64 overflow-y-auto'>
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => handleSelect(option)}
                  disabled={option.disabled}
                  className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors duration-200 text-left ${
                    option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  {option.icon && <span className='text-lg'>{renderIcon(option.icon)}</span>}
                  <div className='flex-1'>
                    <div className='font-medium text-gray-900'>{option.name}</div>
                    {option.description && (
                      <div className='text-sm text-gray-600'>{option.description}</div>
                    )}
                  </div>
                  {selected?.id === option.id && <Check className='w-5 h-5 text-teal-600' />}
                </button>
              ))
            ) : (
              <div className='p-4 text-center text-gray-500 text-sm'>{emptyMessage}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Réexport des types et utilitaires pour la compatibilité
export type { DropdownOption, CustomDropdownProps } from '@/lib/dropdown-types';
export { createStringOptions, createEntityOptions } from '@/lib/dropdown-utils';
export { useDropdownData } from '@/hooks/useDropdownData';
