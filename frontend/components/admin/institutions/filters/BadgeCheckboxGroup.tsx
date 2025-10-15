'use client';

import { Check } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';

export type Option<T extends string> = { value: T; label: string };

interface Props<T extends string> {
  options: ReadonlyArray<Option<T>>;
  values: ReadonlyArray<T>;
  onChange: (next: T[]) => void;
  name?: string;
  idPrefix?: string;
  className?: string;
}

export default function BadgeCheckboxGroup<T extends string>({
  options,
  values,
  onChange,
  name,
  idPrefix = 'chk',
  className,
}: Props<T>) {
  const toggle = (v: T) => {
    const next = values.includes(v) ? values.filter(x => x !== v) : [...values, v];
    onChange(next as T[]);
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className ?? ''}`}>
      {options.map((opt, i) => {
        const id = `${idPrefix}-${String(opt.value)}-${i}`;
        const selected = values.includes(opt.value);

        return (
          <div key={opt.value} className='inline-flex'>
            <input
              id={id}
              name={name}
              type='checkbox'
              value={opt.value}
              checked={selected}
              onChange={() => toggle(opt.value)}
              className='sr-only peer'
            />
            <label htmlFor={id}>
              <Badge
                variant='outline'
                className={[
                  'rounded-full cursor-pointer select-none',
                  'px-1.5 ',
                  'bg-[#F7F7F7] border-[#EAEAEA]',
                  'text-[12px] font-medium text-[#2B2B2B]',
                  'inline-flex items-center gap-1',
                  'peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2',
                ].join(' ')}
              >
                <span
                  className={[
                    'h-3 w-3 rounded-full border flex items-center justify-center',
                    selected ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300',
                  ].join(' ')}
                  aria-hidden='true'
                >
                  <Check
                    className={['h-3 w-3', selected ? 'text-white' : 'text-transparent'].join(' ')}
                    strokeWidth={3}
                  />
                </span>
                {opt.label}
              </Badge>
            </label>
          </div>
        );
      })}
    </div>
  );
}
