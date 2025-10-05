import { Check as CheckIcon } from 'lucide-react';
import React from 'react';

type ChipProps = {
  label: string;
  checked: boolean;
  onToggle: () => void;
  inputType: 'checkbox' | 'radio';
  name?: string;
  value?: string;
  className?: string;
};

export default function FilterChip({
  label,
  checked,
  onToggle,
  inputType,
  name,
  value,
  className,
}: ChipProps) {
  return (
    <label
      className={`inline-flex items-center rounded-full border px-1 py-1 cursor-pointer select-none transition
      ${checked ? 'bg-green-50 border-green-600' : 'bg-gray-100 border-gray-200'} ${className ?? ''}`}
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
        aria-hidden='true'
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
}
