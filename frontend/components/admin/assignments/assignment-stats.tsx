'use client';

import { Users, CheckCircle2, Clock3, TrendingUp } from 'lucide-react';

import type { BeneficiaryAssignmentSummary } from '@/types/modules/assignments';

export default function AssignmentStats({ data }: { data: BeneficiaryAssignmentSummary[] }) {
  const totalBeneficiaries = data.length;
  const totalAssignments = data.reduce((s, b) => s + b.assignmentsCount, 0);
  const totalCompleted = data.reduce((s, b) => s + b.completedCount, 0);

  const avgProgress =
    totalBeneficiaries === 0
      ? 0
      : Math.round(data.reduce((s, b) => s + (b.avgProgressPercent ?? 0), 0) / totalBeneficiaries);

  const cards = [
    { label: 'Assignations', value: totalAssignments, Icon: Users },
    { label: 'En cours', value: data.reduce((s, b) => s + b.inProgressCount, 0), Icon: Clock3 },
    { label: 'Complétés', value: totalCompleted, Icon: CheckCircle2 },
    { label: 'Progression moy.', value: `${avgProgress}%`, Icon: TrendingUp },
  ];

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
      {cards.map(({ label, value, Icon }) => (
        <div key={label} className='bg-white border border-gray-100 rounded-xl shadow-sm px-4 py-3'>
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center'>
              <Icon className='h-5 w-5 text-gray-600' />
            </div>
            <div>
              <p className='text-xs text-gray-500'>{label}</p>
              <p className='text-xl font-semibold text-gray-900'>{value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
