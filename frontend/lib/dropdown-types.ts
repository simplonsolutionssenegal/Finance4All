// Types pour le composant CustomDropdown

export interface DropdownOption<T = unknown> {
  id: string;
  name: string;
  value: T;
  icon?: string;
  description?: string;
  disabled?: boolean;
}

export interface CustomDropdownProps<T = unknown> {
  options: DropdownOption<T>[];
  selected: DropdownOption<T> | null;
  onSelect: (option: DropdownOption<T>) => void;
  placeholder: string;
  icon?: React.ReactNode;
  searchable?: boolean;
  disabled?: boolean;
  className?: string;
  emptyMessage?: string;
  maxHeight?: string;
}
