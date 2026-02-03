'use client';

import { useMemo } from 'react';

import AssignmentStats from '@/components/admin/assignments/assignment-stats';
import BeneficiaryRow from '@/components/admin/assignments/beneficiary-row';
import { useBeneficiariesAssignmentSummary } from '@/hooks/assignments/useBeneficiariesAssignmentSummary';

export default function AssignmentsPage() {
  const { data: beneficiaries, loading, error, refetch } = useBeneficiariesAssignmentSummary();

  const title = useMemo(() => 'Assignation de modules', []);

  if (loading) return <div className='p-6'>Chargement…</div>;
  if (error) return <div className='p-6 text-red-500'>{error.message}</div>;

  return (
    <div className='p-6 max-w-7xl mx-auto'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-gray-900'>{title}</h1>
        <p className='text-gray-500 mt-1'>Gérez l&apos;apprentissage de vos bénéficiaires</p>
      </div>

      <AssignmentStats data={beneficiaries} />

      <div className='mt-6 space-y-3'>
        {beneficiaries.length === 0 ? (
          <p className='text-center text-gray-500 py-8'>Aucun bénéficiaire trouvé</p>
        ) : (
          beneficiaries.map(b => <BeneficiaryRow key={b.id} beneficiary={b} onAssigned={refetch} />)
        )}
      </div>
    </div>
  );
}
