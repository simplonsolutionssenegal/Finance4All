import type { LucideIcon } from 'lucide-react';
import React from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InputFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hasError?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  maxLength?: number;
  minLength?: number;
  icon?: LucideIcon;
  className?: string;
}

export function InputField({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  hasError = false,
  errorMessage,
  disabled = false,
  required = false,
  autoComplete,
  maxLength,
  minLength,
  icon: Icon,
  className = '',
}: InputFieldProps) {
  return (
    <div className='space-y-2'>
      <Label htmlFor={id} className='text-foreground font-medium text-gray-700'>
        {label}
      </Label>
      <div className='relative'>
        {Icon && (
          <Icon className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
        )}
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full h-12 ${Icon ? 'pl-10' : 'pl-3'} bg-gray-50 border-gray-200 rounded-lg focus-visible:ring-primary-200 ${
            hasError ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500' : ''
          } ${className}`}
          disabled={disabled}
          autoComplete={autoComplete}
          maxLength={maxLength}
          minLength={minLength}
          required={required}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
        />
      </div>
      {hasError && errorMessage && <ErrorMessage id={`${id}-error`} message={errorMessage} />}
    </div>
  );
}

interface ErrorMessageProps {
  id: string;
  message: string;
}

export function ErrorMessage({ id, message }: ErrorMessageProps) {
  return (
    <div id={id} className='text-red-500 text-sm font-medium' role='alert' aria-live='polite'>
      {message}
    </div>
  );
}

interface SubmitButtonProps {
  isLoading: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function SubmitButton({
  isLoading,
  disabled = false,
  children,
  className = '',
}: SubmitButtonProps) {
  return (
    <button
      type='submit'
      disabled={isLoading || disabled}
      className={`w-full h-12 bg-primary-200 hover:bg-primary-300/90 text-white font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg flex items-center justify-center gap-2 ${className}`}
    >
      {children}
    </button>
  );
}
