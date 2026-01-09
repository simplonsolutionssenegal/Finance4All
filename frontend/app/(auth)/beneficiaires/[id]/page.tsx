'use client';

import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useMemo } from 'react';

import { BeneficiaryDetail } from '@/components/beneficiaire/BeneficiaryDetail';
import { useBeneficiaries } from '@/hooks/beneficiary/useBeneficiaries';

export default function BeneficiaryDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';

  const { data: all = [], isLoading, error } = useBeneficiaries();

  const beneficiary = useMemo(() => all.find(b => String(b.id) === String(id)), [all, id]);

  if (isLoading) {
    return (
      <div className='p-6'>
        <p className='text-sm text-slate-500'>Chargement des informations du bénéficiaire…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-6'>
        <p className='text-sm text-red-500'>
          Impossible de charger ce bénéficiaire. Veuillez réessayer.
        </p>
      </div>
    );
  }

  if (!beneficiary) {
    return (
      <div className='p-6'>
        <button
          type='button'
          onClick={() => router.push('/beneficiaires')}
          className='mb-4 inline-flex items-center gap-2 text-sm text-black  hover:text-primary-400'
        >
          <ArrowLeft className='h-4 w-4' />
          Retour à la liste
        </button>

        <p className='text-sm text-slate-500'>Bénéficiaire introuvable.</p>
      </div>
    );
  }

  return (
    <BeneficiaryDetail beneficiary={beneficiary} onBack={() => router.push('/beneficiaires')} />
  );
}
