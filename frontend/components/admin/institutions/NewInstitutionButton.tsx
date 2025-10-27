'use client';

import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function NewInstitutionButton() {
  return (
    <Button
      onClick={() => {
        globalThis.dispatchEvent(new CustomEvent('open-institution-modal'));
      }}
      className='bg-teal-500 hover:bg-teal-600 text-white rounded-xl gap-2 h-10 px-4'
      style={{ backgroundColor: 'var(--primary-200)' }}
    >
      <Plus className='w-5 h-5' />
      <span className='hidden sm:inline'>Nouvelle institution</span>
    </Button>
  );
}
