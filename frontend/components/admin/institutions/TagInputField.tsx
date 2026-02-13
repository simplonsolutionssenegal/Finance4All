'use client';

import { Plus, X } from 'lucide-react';
import { useState } from 'react';

import Chip from '@/components/admin/institutions/Chip';
import { Button } from '@/components/ui/button';
import { FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const cx = (...c: (string | boolean | undefined)[]) => c.filter(Boolean).join(' ');

export function TagInputField({
  label,
  placeholder,
  value,
  onChange,
  disabled = false,
  error = false,
}: {
  label: string;
  placeholder: string;
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  error?: boolean;
}) {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    const next = input.trim();
    if (!next) return;
    if (!value.includes(next)) onChange([...value, next]);
    setInput('');
  };

  const handleRemoveByValue = (val: string) => {
    if (!disabled) onChange(value.filter(v => v !== val));
  };

  return (
    <>
      <FormLabel className='text-sm font-normal'>{label}</FormLabel>
      <div className='flex gap-2'>
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={placeholder}
          className={cx(
            'bg-[#F8F9FA] shadow-none transition-all',
            'focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent',
            error ? 'border-red-500 focus:ring-red-500' : 'border-transparent'
          )}
          disabled={disabled}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
        />

        <Button
          type='button'
          onClick={handleAdd}
          disabled={disabled || !input.trim()}
          className='bg-cyan-400 hover:bg-cyan-500'
        >
          <Plus className='w-4 h-4' />
        </Button>
      </div>

      {value.length > 0 && (
        <div className='flex flex-wrap gap-2 mt-2'>
          {value.map(item => (
            <Chip
              key={item}
              variant='secondary'
              onClick={() => handleRemoveByValue(item)}
              className='bg-gray-200 px-3 py-1'
              ariaLabel={`Supprimer ${item}`}
            >
              {item}
              <X className='w-3 h-3 ml-1' />
            </Chip>
          ))}
        </div>
      )}

      <FormMessage className='text-xs text-red-600 min-h-[16px]' />
    </>
  );
}
