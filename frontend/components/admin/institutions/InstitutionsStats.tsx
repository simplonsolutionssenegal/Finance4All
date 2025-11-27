'use client';

import { Building2, CheckCircle2, AlertCircle, Archive, Settings } from 'lucide-react';

import { useGetInstitutions } from '@/hooks/institution/useGetInstitutions';
import { InstitutionStatus } from '@/types/Institution';

export default function InstitutionsStats() {
  const { institutions, pagination } = useGetInstitutions({ page: 1, limit: 10 });

  const total = pagination?.total ?? institutions.length ?? 0;
  const actives = institutions.filter(i => i.status === InstitutionStatus.ACTIVE).length;
  const inactives = institutions.filter(i => i.status === InstitutionStatus.INACTIVE).length;
  const archived = 0; // Pas encore de statut archived
  const pending = institutions.filter(i => i.status === InstitutionStatus.PENDING).length;

  const cards = [
    {
      title: 'Total',
      value: total,
      icon: Building2,
      badge: 'bg-[#6EC1E41A] text-[#6EC1E4]',
    },
    {
      title: 'Actives',
      value: actives,
      icon: CheckCircle2,
      badge: 'bg-[#16A34A1A] text-[#16A34A]',
    },
    {
      title: 'Inactives',
      value: inactives,
      icon: AlertCircle,
      badge: 'bg-[#F59E0B1A] text-[#F59E0B]',
    },
    {
      title: 'Archivées',
      value: archived,
      icon: Archive,
      badge: 'bg-[#E9ECEF] text-[#6C757D]',
    },
    {
      title: 'En attente',
      value: pending,
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
          {/* Icône en haut */}
          <div className={`inline-flex items-center justify-center h-11 w-11 rounded-xl ${badge}`}>
            <Icon className='h-5 w-5' strokeWidth={2} />
          </div>

          {/* Valeur (nombre) */}
          <div className='text-4xl leading-none text-secondary-300 tracking-tight'>{value}</div>

          {/* Titre (libellé) */}
          <div className='text-sm font-normal text-tertiary-400 text-muted-foreground tracking-wide'>
            {title}
          </div>
        </div>
      ))}
    </div>
  );
}
