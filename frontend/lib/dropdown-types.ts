// Types pour le composant CustomDropdown

export type IconType = string | React.ReactNode;

export interface DropdownOption<T = unknown> {
  id: string;
  name: string;
  value: T;
  icon?: IconType;
  description?: string;
  disabled?: boolean;
}

export interface CustomDropdownProps<T = unknown> {
  options: DropdownOption<T>[];
  selected: DropdownOption<T> | null;
  onSelect: (option: DropdownOption<T>) => void;
  placeholder: string;
  icon?: IconType;
  searchable?: boolean;
  disabled?: boolean;
  className?: string;
  emptyMessage?: string;
  maxHeight?: string;
}
