'use client';

import * as React from 'react';
import type { Control, FieldValues, Path } from 'react-hook-form';

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ');

const blockInvalidNumberKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
};

const toNumberOrUndefined = (v: string) => (v ? Number(v) : undefined);

const baseNumberInput =
  'bg-[#F8F9FA] shadow-none transition-all ' +
  '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

const inputClass = (hasError: boolean, extra?: string) =>
  cx(
    baseNumberInput,
    'focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent',
    hasError ? 'border-red-500 focus:ring-red-500' : 'border-transparent',
    extra
  );

export type NumericFormFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  requiredMark?: boolean;
  placeholder?: string;
  step?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
  containerClassName?: string;
  inputClassName?: string;
};

const NumericFormField = <T extends FieldValues>({
  control,
  name,
  label,
  requiredMark = false,
  placeholder = '0',
  step,
  min = 0,
  max,
  disabled = false,
  containerClassName,
  inputClassName,
}: NumericFormFieldProps<T>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={containerClassName}>
          <FormLabel className='font-normal '>
            {label} {requiredMark && '*'}
          </FormLabel>
          <FormControl>
            <Input
              type='number'
              step={step}
              min={min}
              max={max}
              placeholder={placeholder}
              className={inputClass(!!fieldState.error, inputClassName)}
              {...field}
              value={(field.value as number | undefined) ?? ''}
              onKeyDown={blockInvalidNumberKeys}
              onChange={e => field.onChange(toNumberOrUndefined(e.target.value))}
              disabled={disabled}
            />
          </FormControl>
          <div className='min-h-[16px]'>
            <FormMessage className='text-xs text-red-600' />
          </div>
        </FormItem>
      )}
    />
  );
};

export default NumericFormField;
