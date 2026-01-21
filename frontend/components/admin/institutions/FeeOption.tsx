'use client';

import { MoveRight } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { RadioGroupItem } from '@/components/ui/radio-group';
import type { FeeTypeUI } from '@/types/serviceForm.shared';

export function FeeOption({
  id,
  value,
  title,
  description,
}: {
  id: string;
  value: FeeTypeUI;
  title: string;
  description?: string;
}) {
  return (
    <div className='flex items-center gap-2 rounded-lg border-1 border-gray-300 p-2 hover:bg-gray-50 cursor-pointer'>
      <RadioGroupItem
        id={id}
        value={value}
        className='
          h-2 w-2 rounded-full border-0
          text-primary-300
          data-[state=checked]:bg-primary-300
          data-[state=checked]:border-primary-300
          data-[state=checked]:text-primary-300
          data-[state=checked]:[&>span]:bg-primary-300 
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2
        '
      />
      <Label htmlFor={id} className='cursor-pointer flex-1'>
        <div className='flex items-center gap-2 flex-wrap'>
          <span className='font-normal'>{title}</span>
          {description && (
            <>
              <MoveRight className='h-3 w-6 opacity-60' aria-hidden />
              <span className='font-normal text-gray-500'>{description}</span>
            </>
          )}
        </div>
      </Label>
    </div>
  );
}
