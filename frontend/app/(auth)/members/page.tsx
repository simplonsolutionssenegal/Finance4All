'use client';

import { Users, UserCheck, Clock } from 'lucide-react';

import MembersList from '@/components/organization/MembersList';
import { Card, CardContent } from '@/components/ui/card';
import { useOrgMembers } from '@/hooks/organization/useOrgMembers';

export default function MembersPage() {
  const { organizationName, totalCount, membersByRole, pendingCount } = useOrgMembers();

  const stats = [
    {
      label: 'Total membres',
      value: totalCount,
      icon: Users,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      label: 'Admins',
      value: membersByRole['org:admin'] || 0,
      icon: UserCheck,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      label: 'Membres',
      value: membersByRole['org:member'] || 0,
      icon: Users,
      color: 'text-green-600 bg-green-100',
    },
    {
      label: 'En attente',
      value: pendingCount,
      icon: Clock,
      color: 'text-orange-600 bg-orange-100',
    },
  ];

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-6xl text-tertiary-400 tracking-tight leading-tight mb-1'>Membres</h1>
        <p className='text-lg text-tertiary-400/60 text-muted-foreground font-normal tracking-normal'>
          Gestion des membres de {organizationName || 'votre organisation'}
        </p>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className='bg-white shadow-sm border border-gray-100 rounded-2xl'
            >
              <CardContent className='p-4 flex items-center gap-3'>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className='h-5 w-5' />
                </div>
                <div>
                  <p className='text-2xl font-bold text-gray-900'>{stat.value}</p>
                  <p className='text-sm text-gray-500'>{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <MembersList />
    </div>
  );
}
