'use client';

import type { LucideIcon } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

export interface StatCardItem {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
}

interface StatsCardsProps {
  items: StatCardItem[];
  isLoading?: boolean;
}

export default function StatsCards({ items, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
        {[1, 2, 3, 4].map(i => (
          <Card
            key={i}
            className='bg-white shadow-sm border border-gray-100 rounded-2xl animate-pulse'
          >
            <CardContent className='p-6'>
              <div className='h-10 w-10 rounded-xl bg-gray-200 mb-4' />
              <div className='h-4 w-24 bg-gray-200 rounded mb-2' />
              <div className='h-8 w-16 bg-gray-200 rounded' />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
      {items.map(stat => {
        const Icon = stat.icon;

        return (
          <Card key={stat.id} className='bg-white shadow-sm border border-gray-100 rounded-2xl'>
            <CardContent className='p-6'>
              <div className={`p-3 rounded-xl ${stat.iconBg} w-fit mb-4`}>
                <Icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <p className='text-sm font-medium text-gray-500'>{stat.title}</p>
              <p className='text-2xl font-bold text-gray-900 mt-1'>{stat.value}</p>
              {stat.subtitle && <p className='text-sm text-gray-500 mt-1'>{stat.subtitle}</p>}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
