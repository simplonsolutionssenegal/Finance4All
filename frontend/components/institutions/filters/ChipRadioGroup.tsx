import React from 'react';

import type { Option } from './ChipCheckboxGroup';
import FilterChip from './FilterChip';

export default function ChipRadioGroup<T extends string>({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: ReadonlyArray<Option<T>>;
  value: T | '';
  onChange: (next: T) => void;
}) {
  return (
    <div className='flex flex-wrap gap-2'>
      {options.map(opt => (
        <FilterChip
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
