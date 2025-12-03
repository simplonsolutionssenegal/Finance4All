'use client';

import { useOrganization, useUser } from '@clerk/nextjs';
import { Users, Shield, Building2, UserCheck, Archive } from 'lucide-react';
import { useMemo } from 'react';

import { Card, CardContent } from '@/components/ui/card';

interface UserStatsCardsProps {
  onFilterChange?: (role: string) => void;
  selectedRole?: string;
}

export default function UserStatsCards({
  onFilterChange,
  selectedRole = 'all',
}: UserStatsCardsProps) {
  const { memberships } = useOrganization({
    memberships: {
      infinite: true,
    },
    invitations: true,
  });

  const { user } = useUser();

  const stats = useMemo(() => {
    if (!memberships?.data) {
      return {
        totalActifs: 0,
        administrateurs: 0,
        organisations: 0,
        beneficiaires: 0,
        archives: 0,
      };
    }

    const activeMemberships = memberships.data.filter(membership => membership.publicUserData);
    const totalActifs = activeMemberships.length;
    const administrateurs = memberships.data.filter(
      membership => membership.role === 'org:admin'
    ).length;
    const organisations = user?.organizationMemberships?.length || 0;
    const beneficiaires = memberships.data.filter(
      membership => membership.role === 'org:recipient'
    ).length;
    const archives = 0; // Pas encore implémenté

    return {
      totalActifs,
      administrateurs,
      organisations,
      beneficiaires,
      archives,
    };
  }, [memberships?.data, user?.organizationMemberships]);

  const statsData = [
    {
      id: 1,
      title: 'Total actifs',
      value: stats.totalActifs.toString(),
      icon: Users,
      iconColor: 'text-primary-400',
      filterValue: 'all',
    },
    {
      id: 2,
      title: 'Administrateurs',
      value: stats.administrateurs.toString(),
      icon: Shield,
      iconColor: 'text-blue-500',
      filterValue: 'org:admin',
    },
    {
      id: 3,
      title: 'Organisations',
      value: stats.organisations.toString(),
      icon: Building2,
      iconColor: 'text-gray-600',
      filterValue: 'org:member',
    },
    {
      id: 4,
      title: 'Bénéficiaires',
      value: stats.beneficiaires.toString(),
      icon: UserCheck,
      iconColor: 'text-gray-600',
      filterValue: 'org:recipient',
    },
    {
      id: 5,
      title: 'Archivés',
      value: stats.archives.toString(),
      icon: Archive,
      iconColor: 'text-gray-600',
      filterValue: 'archived',
    },
  ];

  const handleCardClick = (filterValue: string) => {
    if (onFilterChange) {
      // Toggle: si déjà sélectionné, réinitialiser à 'all'
      if (selectedRole === filterValue) {
        onFilterChange('all');
      } else {
        onFilterChange(filterValue);
      }
    }
  };

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
      {statsData.map(stat => {
        const Icon = stat.icon;
        const isClickable = !!onFilterChange;

        return (
          <Card
            key={stat.id}
            className={`relative bg-white shadow-sm border border-gray-100 rounded-2xl transition-all ${
              isClickable ? 'cursor-pointer hover:shadow-md hover:border-gray-200' : ''
            }`}
            onClick={() => isClickable && handleCardClick(stat.filterValue)}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : undefined}
            onKeyDown={e => {
              if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                handleCardClick(stat.filterValue);
              }
            }}
          >
            <CardContent className='p-6 flex flex-col space-y-8 justify-between h-full'>
              {/* Icône en haut */}
              <Icon className={`w-6 h-6 ${stat.iconColor}`} strokeWidth={1.5} />

              {/* Valeur (nombre) */}
              <div className='text-4xl font-bold text-gray-900'>{stat.value}</div>

              {/* Label */}
              <div className='text-sm text-gray-500'>{stat.title}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
