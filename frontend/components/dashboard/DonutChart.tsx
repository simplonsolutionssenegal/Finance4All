'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBeneficiaryStats } from '@/hooks/dashboard/useBeneficiaryStats';

export default function DonutChart() {
  const { stats, isLoading } = useBeneficiaryStats();

  const data = useMemo(() => {
    if (!stats || stats.total === 0) return [];
    const men = stats.total - stats.women;
    return [
      { name: 'Femmes', value: stats.women, color: '#ec4899' },
      { name: 'Hommes', value: men, color: '#3b82f6' },
    ];
  }, [stats]);

  return (
    <Card className='bg-white shadow-sm border border-gray-100 rounded-2xl'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium text-gray-500'>Repartition par genre</CardTitle>
      </CardHeader>
      <CardContent className='pb-6'>
        <div className='flex flex-col items-center space-y-6'>
          <div className='relative w-40 h-40'>
            {data.length > 0 ? (
              <>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={data}
                      cx='50%'
                      cy='50%'
                      innerRadius={55}
                      outerRadius={80}
                      startAngle={90}
                      endAngle={450}
                      dataKey='value'
                      stroke='none'
                    >
                      {data.map(entry => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className='absolute inset-0 flex items-center justify-center'>
                  <div className='text-center'>
                    <div className='text-xl font-bold text-gray-900'>{stats?.total ?? 0}</div>
                    <div className='text-xs text-gray-500'>Total</div>
                  </div>
                </div>
              </>
            ) : (
              <div className='flex h-full items-center justify-center text-sm text-gray-400'>
                {isLoading ? 'Chargement...' : 'Aucune donnee'}
              </div>
            )}
          </div>

          <div className='space-y-4 w-full'>
            {data.map(item => (
              <div key={item.name} className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  <div className='w-3 h-3 rounded-full' style={{ backgroundColor: item.color }} />
                  <span className='text-sm text-gray-600'>{item.name}</span>
                </div>
                <div className='flex items-center space-x-2'>
                  <span className='text-sm font-semibold text-gray-900'>{item.value}</span>
                  {stats && stats.total > 0 && (
                    <span className='text-xs text-gray-400'>
                      ({Math.round((item.value / stats.total) * 100)}%)
                    </span>
                  )}
                </div>
              </div>
            ))}
            {stats && stats.total > 0 && (
              <div className='flex items-center justify-between pt-2 border-t border-gray-100'>
                <div className='flex items-center space-x-3'>
                  <div className='w-3 h-3 rounded-full bg-amber-400' />
                  <span className='text-sm text-gray-600'>Jeunes (-30 ans)</span>
                </div>
                <div className='flex items-center space-x-2'>
                  <span className='text-sm font-semibold text-gray-900'>{stats.youth}</span>
                  <span className='text-xs text-gray-400'>
                    ({Math.round((stats.youth / stats.total) * 100)}%)
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
