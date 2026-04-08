'use client';

import { Users, Shield, Building2, UserCheck, Archive } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

interface PlatformStats {
  totalUsers: number;
  totalOrganizations: number;
  adminsOrg: number;
  membersOrg: number;
  recipients: number;
  platformAdmins: number;
  platformMembers: number;
}

interface UserStatsCardsProps {
  onFilterChange?: (role: string) => void;
  selectedRole?: string;
  stats: PlatformStats;
  isLoading: boolean;
}

export default function UserStatsCards({
  onFilterChange,
  selectedRole = 'all',
  stats,
  isLoading,
}: UserStatsCardsProps) {
  const statsData = [
    {
      id: 1,
      title: 'Total actifs',
      value: isLoading ? '...' : stats.totalUsers.toString(),
      icon: Users,
      iconColor: 'text-primary-400',
      filterValue: 'all',
    },
    {
      id: 2,
      title: 'Administrateurs',
      value: isLoading
        ? '...'
        : (stats.adminsOrg + stats.platformAdmins + stats.platformMembers).toString(),
      icon: Shield,
      iconColor: 'text-blue-500',
      filterValue: 'org:admin',
    },
    {
      id: 3,
      title: 'Organisations',
      value: isLoading ? '...' : stats.totalOrganizations.toString(),
      icon: Building2,
      iconColor: 'text-gray-600',
      filterValue: 'org:member',
    },
    {
      id: 4,
      title: 'Bénéficiaires',
      value: isLoading ? '...' : stats.recipients.toString(),
      icon: UserCheck,
      iconColor: 'text-gray-600',
      filterValue: 'org:recipient',
    },
    {
      id: 5,
      title: 'Archivés',
      value: '0',
      icon: Archive,
      iconColor: 'text-gray-600',
      filterValue: 'archived',
    },
  ];

  const handleCardClick = (filterValue: string) => {
    if (onFilterChange) {
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
              <Icon className={`w-6 h-6 ${stat.iconColor}`} strokeWidth={1.5} />
              <div className='text-4xl font-bold text-gray-900'>{stat.value}</div>
              <div className='text-sm text-gray-500'>{stat.title}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
