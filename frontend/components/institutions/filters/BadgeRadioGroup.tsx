'use client';

import * as React from 'react';

import { Badge } from '@/components/ui/badge';

import type { Option } from './BadgeCheckboxGroup';

interface Props<T extends string> {
  name: string;
  options: ReadonlyArray<Option<T>>;
  value: T | '';
  onChange: (next: T) => void;
  idPrefix?: string;
  className?: string;
}

export default function BadgeRadioGroup<T extends string>({
  name,
  options,
  value,
  onChange,
  idPrefix = 'rad',
  className,
}: Props<T>) {
  return (
    <div className={`flex flex-wrap gap-2 ${className ?? ''}`}>
      {options.map((opt, i) => {
        const id = `${idPrefix}-${String(opt.value)}-${i}`;
        const selected = value === opt.value;

        return (
          <div key={opt.value} className='inline-flex'>
            <input
              id={id}
              name={name}
              type='radio'
              value={opt.value}
              checked={selected}
              onChange={() => onChange(opt.value)}
              className='sr-only peer'
            />
            <label htmlFor={id}>
              <Badge
                variant='outline'
                className={[
                  'rounded-full cursor-pointer select-none',
                  'px-2',
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
                  <svg viewBox='0 0 24 24' className='h-3 w-3'>
                    <path
                      d='M20 6L9 17l-5-5'
                      className={
                        selected ? 'fill-none stroke-white' : 'fill-none stroke-transparent'
                      }
                      strokeWidth='3'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
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

{
  /* <Badge
          variant="secondary"
          className="bg-blue-500 text-white dark:bg-blue-600"
        >
          <BadgeCheckIcon />
          Verified
        </Badge> */
}

//           <Badge asChild variant="secondary" className="cursor-pointer bg-blue-500 text-white">
//   <button type="button"  aria-label="Voir le détail">
//     <BadgeCheckIcon className="mr-1" />
//     Verified
//   </button>
// </Badge>
