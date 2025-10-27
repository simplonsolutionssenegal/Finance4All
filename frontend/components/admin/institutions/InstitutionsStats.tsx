'use client';

import { CheckCircle2, Ban, Archive, Settings } from 'lucide-react';

import { useGetInstitutions } from '@/hooks/institution/useGetInstitutions';
import { InstitutionStatus } from '@/types/Institution';

export default function InstitutionsStats() {
  const { institutions, pagination } = useGetInstitutions({ page: 1, limit: 10 });

  const total = pagination?.total ?? institutions.length ?? 0;
  const actives = institutions.filter(i => i.status === InstitutionStatus.ACTIVE).length;
  const inactives = institutions.filter(i => i.status === InstitutionStatus.INACTIVE).length;
  const pending = institutions.filter(i => i.status === InstitutionStatus.PENDING).length;

  const cards = [
    {
      title: 'Total',
      value: total,
      icon: CheckCircle2,
      badge: 'bg-sky-100 text-sky-600',
    },
    {
      title: 'Actives',
      value: actives,
      icon: CheckCircle2,
      badge: 'bg-emerald-100 text-emerald-600',
    },
    {
      title: 'Inactives',
      value: inactives,
      icon: Ban,
      badge: 'bg-amber-100 text-amber-600',
    },
    {
      title: 'Archivées',
      value: 0,
      icon: Archive,
      badge: 'bg-zinc-100 text-zinc-600',
    },
    {
      title: 'En attente',
      value: pending,
      icon: Settings,
      badge: 'bg-fuchsia-100 text-fuchsia-600',
    },
  ];

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5'>
      {cards.map(({ title, value, icon: Icon, badge }) => (
        <div
          key={title}
          className='
            relative overflow-hidden
            rounded-2xl bg-white
            p-5 sm:p-6
            /* shadow compact & prononcé (deux couches, peu étalé) */
            shadow-[0_10px_22px_-10px_rgba(0,0,0,.35),0_4px_10px_-4px_rgba(0,0,0,.25)]
          '
        >
          {/* pastille icône */}
          <div className={`inline-flex items-center justify-center h-9 w-9 rounded-xl ${badge}`}>
            <Icon className='h-5 w-5' />
          </div>

          {/* valeur bien visible */}
          <div className='mt-6 text-2xl font-semibold tracking-tight text-slate-800'>{value}</div>

          {/* libellé en bas à gauche */}
          <div className='mt-8 text-sm text-slate-500'>{title}</div>
        </div>
      ))}
    </div>
  );
}
