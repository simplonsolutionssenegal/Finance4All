'use client';

import { Users, Building2, UserCheck, GraduationCap } from 'lucide-react';
import { useMemo } from 'react';

import BarChart from '@/components/dashboard/BarChart';
import DonutChart from '@/components/dashboard/DonutChart';
import GrowthChart from '@/components/dashboard/GrowthChart';
import InstitutionsList from '@/components/dashboard/InstitutionsList';
import StatsCards, { type StatCardItem } from '@/components/dashboard/StatsCards';
import { useBeneficiaryStats } from '@/hooks/dashboard/useBeneficiaryStats';
import { usePlatformStats } from '@/hooks/organization/usePlatformStats';

export default function PlatformDashboard() {
  const { stats: platformStats, isLoading: platformLoading } = usePlatformStats();
  const { stats: beneficiaryStats, isLoading: beneficiaryLoading } = useBeneficiaryStats();

  const isLoading = platformLoading || beneficiaryLoading;

  const statsItems: StatCardItem[] = useMemo(
    () => [
      {
        id: 'beneficiaries',
        title: 'Inscrits',
        value: beneficiaryStats?.total ?? 0,
        subtitle: beneficiaryStats ? `${beneficiaryStats.inTraining} en formation` : undefined,
        icon: Users,
        iconColor: 'text-blue-500',
        iconBg: 'bg-blue-100',
      },
      {
        id: 'women',
        title: 'Femmes',
        value: beneficiaryStats?.women ?? 0,
        subtitle: beneficiaryStats?.total
          ? `${Math.round((beneficiaryStats.women / beneficiaryStats.total) * 100)}% du total`
          : undefined,
        icon: UserCheck,
        iconColor: 'text-pink-500',
        iconBg: 'bg-pink-100',
      },
      {
        id: 'youth',
        title: 'Jeunes (-30 ans)',
        value: beneficiaryStats?.youth ?? 0,
        subtitle: beneficiaryStats?.total
          ? `${Math.round((beneficiaryStats.youth / beneficiaryStats.total) * 100)}% du total`
          : undefined,
        icon: GraduationCap,
        iconColor: 'text-amber-500',
        iconBg: 'bg-amber-100',
      },
      {
        id: 'organizations',
        title: 'Organisations',
        value: platformStats?.totalOrganizations ?? 0,
        subtitle: `${platformStats?.totalUsers ?? 0} utilisateurs`,
        icon: Building2,
        iconColor: 'text-emerald-500',
        iconBg: 'bg-emerald-100',
      },
    ],
    [beneficiaryStats, platformStats]
  );

  return (
    <div className='min-h-full bg-gray-50'>
      <div className='space-y-6'>
        <StatsCards items={statsItems} isLoading={isLoading} />

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <GrowthChart />
          <DonutChart />
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <BarChart />
          <InstitutionsList />
        </div>
      </div>
    </div>
  );
}
