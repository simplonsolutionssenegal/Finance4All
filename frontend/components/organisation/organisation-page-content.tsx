'use client';

import { BookOpen, CheckCircle2, TrendingUp, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useMemo } from 'react';

import OrganizationDashboard from '@/components/organisation/OrganizationDashboard';
import { useBeneficiaireDashboardData } from '@/hooks/beneficiary/useBeneficiaireDashboardData';
import { useBeneficiaries } from '@/hooks/beneficiary/useBeneficiaries';

import { activeCount, avgProgress, bucketizeProgress, topPerformers } from './organisation-mappers';

const OrganisationPageContent = () => {
  const router = useRouter();

  // 1) liste bénéficiaires (org)
  const { data: beneficiaries, isLoading: bLoading, error: bError } = useBeneficiaries();

  // 2) dashboard stats (si ton API support org sans userId, laisse undefined)
  const { data: dash, isLoading: dLoading, error: dError } = useBeneficiaireDashboardData(); // ou useBeneficiaireDashboardData(userId)

  const loading = bLoading || dLoading;
  const error = (bError as any)?.message || bError || dError || null;

  // --- Calculs ---
  const active = useMemo(() => activeCount(beneficiaries), [beneficiaries]);
  const avg = useMemo(() => avgProgress(beneficiaries), [beneficiaries]);
  const buckets = useMemo(() => bucketizeProgress(beneficiaries), [beneficiaries]);
  const top = useMemo(() => topPerformers(beneficiaries, 5), [beneficiaries]);

  // engagement mensuel: on transforme monthlyProgress -> actifs/completes
  // Ici: "actifs" = progress, "completes" = progress (ou une autre série si tu en as)
  const engagementData = useMemo(() => {
    const mp = dash?.monthlyProgress ?? [];
    return mp.map(x => ({
      month: x.month,
      actifs: x.progress, // courbe 1
      completes: x.progress, // courbe 2 (si tu as une vraie stat, remplace)
    }));
  }, [dash]);

  const stats = useMemo(
    () => [
      {
        label: 'Bénéficiaires actifs',
        value: loading ? '—' : active,
        hint: error ? 'Erreur de chargement' : '+2 ce mois',
        icon: <Users className='h-5 w-5' />,
        accent: 'slate' as const,
      },
      {
        label: 'Modules assignés',
        value: loading ? '—' : (dash?.moduleStats?.total ?? 0),
        hint: '+12 cette semaine',
        icon: <BookOpen className='h-5 w-5' />,
        accent: 'blue' as const,
      },
      {
        label: 'Taux de complétion',
        value: loading ? '—' : `${dash?.stats?.globalProgress ?? 0}%`,
        hint: '+5% ce mois',
        icon: <CheckCircle2 className='h-5 w-5' />,
        accent: 'green' as const,
      },
      {
        label: 'Progression moyenne',
        value: loading ? '—' : `${avg}%`,
        hint: 'Très bien !',
        icon: <TrendingUp className='h-5 w-5' />,
        accent: 'slate' as const,
      },
    ],
    [active, avg, dash, loading, error]
  );

  return (
    <div className='p-6 max-w-6xl mx-auto'>
      <OrganizationDashboard
        orgName='Microcrédit Sénégal'
        subtitle='Suivi de vos bénéficiaires'
        stats={stats}
        engagementData={engagementData}
        performanceBuckets={buckets}
        topPerformers={top}
        onManageBeneficiaries={() => router.push('/beneficiaires')}
        onAssignModules={() => router.push('/modules')}
        onViewCertificates={() => router.push('/certificats')}
      />
    </div>
  );
};

export default OrganisationPageContent;
