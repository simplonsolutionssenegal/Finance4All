import React from 'react';

import FilterChip from './FilterChip';

export type Option<T extends string> = { value: T; label: string };

export default function ChipCheckboxGroup<T extends string>({
  options,
  values,
  onChange,
}: {
  options: ReadonlyArray<Option<T>>;
  values: ReadonlyArray<T>;
  onChange: (nextValues: T[]) => void;
}) {
  const toggle = (v: T) => {
    const next = values.includes(v) ? values.filter(x => x !== v) : [...values, v];
    onChange(next as T[]);
  };

  return (
    <div className='flex flex-wrap gap-2'>
      {options.map(opt => (
        <FilterChip
          key={opt.value}
          label={opt.label}
          checked={values.includes(opt.value)}
          onToggle={() => toggle(opt.value)}
          inputType='checkbox'
          value={opt.value}
        />
      ))}
    </div>
  );
}
