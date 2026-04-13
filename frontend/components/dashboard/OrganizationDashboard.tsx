'use client';

import { useOrganization } from '@clerk/nextjs';
import { Users, UserCheck, GraduationCap, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

import StatsCards, { type StatCardItem } from '@/components/dashboard/StatsCards';
import { useBeneficiaryStats } from '@/hooks/dashboard/useBeneficiaryStats';

export default function OrganizationDashboard() {
  const { organization } = useOrganization();
  const orgId = organization?.id;
  const { stats, isLoading } = useBeneficiaryStats(orgId);

  const statsItems: StatCardItem[] = useMemo(
    () => [
      {
        id: 'beneficiaries',
        title: 'Inscrits',
        value: stats?.total ?? 0,
        subtitle: stats ? `${stats.inTraining} en formation` : undefined,
        icon: Users,
        iconColor: 'text-blue-500',
        iconBg: 'bg-blue-100',
      },
      {
        id: 'women',
        title: 'Femmes',
        value: stats?.women ?? 0,
        subtitle: stats?.total
          ? `${Math.round((stats.women / stats.total) * 100)}% du total`
          : undefined,
        icon: UserCheck,
        iconColor: 'text-pink-500',
        iconBg: 'bg-pink-100',
      },
      {
        id: 'youth',
        title: 'Jeunes (-30 ans)',
        value: stats?.youth ?? 0,
        subtitle: stats?.total
          ? `${Math.round((stats.youth / stats.total) * 100)}% du total`
          : undefined,
        icon: GraduationCap,
        iconColor: 'text-amber-500',
        iconBg: 'bg-amber-100',
      },
      {
        id: 'inTraining',
        title: 'En formation',
        value: stats?.inTraining ?? 0,
        subtitle: stats?.total
          ? `${Math.round((stats.inTraining / stats.total) * 100)}% du total`
          : undefined,
        icon: BookOpen,
        iconColor: 'text-emerald-500',
        iconBg: 'bg-emerald-100',
      },
    ],
    [stats]
  );

  return (
    <div className='min-h-full bg-gray-50'>
      <div className='space-y-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Dashboard Organisation</h1>
          <p className='mt-1 text-sm text-gray-500'>
            Gerez vos beneficiaires et suivez leur progression.
          </p>
        </div>

        <StatsCards items={statsItems} isLoading={isLoading} />

        <div className='rounded-xl border border-gray-200 bg-white p-8 text-center'>
          <Users className='mx-auto h-12 w-12 text-gray-400' />
          <h2 className='mt-4 text-lg font-semibold text-gray-900'>Recipients</h2>
          <p className='mt-2 text-sm text-gray-500'>
            Consultez et gerez les beneficiaires de votre organisation.
          </p>
          <Link
            href='/recipients'
            className='mt-4 inline-block rounded-lg bg-primary-300 px-6 py-2 text-sm font-medium text-white hover:bg-primary-400'
          >
            Voir les recipients
          </Link>
        </div>
      </div>
    </div>
  );
}
