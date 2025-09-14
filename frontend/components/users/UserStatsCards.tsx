'use client';

import { useOrganization } from '@clerk/nextjs';
import { Users, UserCheck, MoreHorizontal, UserPlus } from 'lucide-react';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function UserStatsCards() {
  const { memberships, invitations } = useOrganization({
    memberships: {
      infinite: true,
    },
    invitations: true,
  });

  const stats = useMemo(() => {
    if (!memberships?.data) {
      return {
        totalUsers: 0,
        activeUsers: 0,
        pendingUsers: 0,
        adminUsers: 0,
      };
    }

    const totalUsers = memberships.data.length;
    const activeUsers = memberships.data.filter(membership => membership.publicUserData).length;
    const pendingUsers = invitations?.count;
    const adminUsers = memberships.data.filter(membership => membership.role === 'admin').length;

    return {
      totalUsers,
      activeUsers,
      pendingUsers,
      adminUsers,
    };
  }, [invitations?.count, memberships?.data]);

  const statsData = [
    {
      id: 1,
      title: 'Total utilisateurs',
      value: stats.totalUsers.toString(),
      subtitle: `${stats.adminUsers} administrateur${stats.adminUsers > 1 ? 's' : ''}`,
      icon: Users,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-100',
    },
    {
      id: 2,
      title: 'Utilisateurs actifs',
      value: stats.activeUsers.toString(),
      subtitle: `${Math.round((stats.activeUsers / (stats.totalUsers || 1)) * 100)}% du total`,
      icon: UserCheck,
      iconColor: 'text-green-500',
      iconBg: 'bg-green-100',
    },
    {
      id: 3,
      title: 'Utilisateurs en attente',
      value: stats.pendingUsers?.toString(),
      subtitle: ``,
      icon: UserPlus,
      iconColor: 'text-orange-500',
      iconBg: 'bg-orange-100',
    },
  ];

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6'>
      {statsData.map(stat => {
        const Icon = stat.icon;

        return (
          <Card
            key={stat.id}
            className='relative bg-white shadow-sm border border-gray-100 rounded-2xl'
          >
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                <Icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                <MoreHorizontal className='w-4 h-4 text-gray-400' />
              </Button>
            </CardHeader>
            <CardContent className='pb-6'>
              <div className='space-y-2'>
                <p className='text-sm font-medium text-gray-500'>{stat.title}</p>
                <p className='text-2xl font-bold text-gray-900'>{stat.value}</p>
                {stat.subtitle !== '' && (
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-1'>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          stat.id === 1
                            ? 'bg-blue-500'
                            : stat.id === 2
                              ? 'bg-green-500'
                              : 'bg-orange-500'
                        }`}
                      />
                      <p className='text-sm text-gray-500'>{stat.subtitle}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
