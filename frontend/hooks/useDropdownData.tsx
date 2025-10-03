import { useState, useMemo } from 'react';

import type { DropdownOption } from '@/lib/dropdown-types';
import { createEntityOptions } from '@/lib/dropdown-utils';

/**
 * Hook personnalisé pour gérer les données de dropdown avec des entités de base de données
 * @param data - Données des entités
 * @param iconField - Champ optionnel pour l'icône
 * @param descriptionField - Champ optionnel pour la description
 * @returns Objet contenant les options formatées
 */
export function useDropdownData<T extends { id: string; name: string }>(
  data: T[],
  iconField?: keyof T,
  descriptionField?: keyof T
) {
  const options = useMemo(
    () => createEntityOptions(data, iconField, descriptionField),
    [data, iconField, descriptionField]
  );

  return { options };
}

/**
 * Hook pour gérer l'état d'un dropdown avec recherche
 * @param initialOptions - Options initiales
 * @param searchable - Si le dropdown est recherchable
 * @returns Objet contenant l'état et les fonctions de gestion
 */
export function useDropdownState<T>(
  initialOptions: DropdownOption<T>[],
  searchable: boolean = false
) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<DropdownOption<T> | null>(null);

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchTerm) return initialOptions;
    return initialOptions.filter(
      option =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (option.description && option.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [initialOptions, searchTerm, searchable]);

  const handleSelect = (option: DropdownOption<T>) => {
    if (option.disabled) return;
    setSelected(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return {
    isOpen,
    searchTerm,
    selected,
    filteredOptions,
    setIsOpen,
    setSearchTerm,
    setSelected,
    handleSelect,
    handleToggle,
    handleClose,
    clearSearch,
  };
}
