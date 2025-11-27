'use client';

import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function NewInstitutionButton() {
  return (
    <Button
      onClick={() => {
        globalThis.dispatchEvent(new CustomEvent('open-institution-modal'));
      }}
      className='h-11 px-5 rounded-xl gap-2 text-white font-medium text-[15px] transition-all'
      style={{ backgroundColor: 'var(--primary-300)' }}
    >
      <Plus className='w-5 h-5' strokeWidth={2.5} />
      <span>Nouvelle institution</span>
    </Button>
  );
}
