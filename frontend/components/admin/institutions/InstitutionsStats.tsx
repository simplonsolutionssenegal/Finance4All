'use client';

import { AlertCircle, Archive, Building2, CheckCircle2, Settings } from 'lucide-react';

import { useGetInstitutionStats } from '@/hooks/institution/useGetInstitutionStats';

export default function InstitutionsStats() {
  const { stats } = useGetInstitutionStats();

  const cards = [
    {
      title: 'Total',
      value: stats?.total ?? 0,
      icon: Building2,
      badge: 'bg-[#6EC1E41A] text-[#6EC1E4]',
    },
    {
      title: 'Actives',
      value: stats?.active ?? 0,
      icon: CheckCircle2,
      badge: 'bg-[#16A34A1A] text-[#16A34A]',
    },
    {
      title: 'Inactives',
      value: stats?.inactive ?? 0,
      icon: AlertCircle,
      badge: 'bg-[#F59E0B1A] text-[#F59E0B]',
    },
    {
      title: 'Archivées',
      value: stats?.archived ?? 0,
      icon: Archive,
      badge: 'bg-[#E9ECEF] text-[#6C757D]',
    },
    {
      title: 'En attente',
      value: stats?.pending ?? 0,
      icon: Settings,
      badge: 'bg-[#F3E8FF] text-[#8200DB]',
    },
  ];

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'>
      {cards.map(({ title, value, icon: Icon, badge }) => (
        <div
          key={title}
          className='
            relative overflow-hidden
            rounded-2xl bg-white
            p-6
            h-[220px]
            flex flex-col justify-between
            shadow-[0_5px_8px_rgba(0,0,0,0.1)]
            transition-shadow duration-200
            hover:shadow-[0_7px_14px_rgba(0,0,0,0.1)]
          '
        >
          <div className={`inline-flex items-center justify-center h-11 w-11 rounded-xl ${badge}`}>
            <Icon className='h-5 w-5' strokeWidth={2} />
          </div>

          <div className='text-4xl leading-none text-secondary-300 tracking-tight'>{value}</div>

          <div className='text-sm font-normal text-tertiary-400 text-muted-foreground tracking-wide'>
            {title}
          </div>
        </div>
      ))}
    </div>
  );
}
