'use client';

import { useMemo } from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import { Card, CardContent } from '@/components/ui/card';
import { useBeneficiaryStats } from '@/hooks/dashboard/useBeneficiaryStats';

export default function DashboardBarChart() {
  const { stats, isLoading } = useBeneficiaryStats();

  const data = useMemo(() => {
    if (!stats) return [];
    const inactive = stats.total - stats.inTraining;
    return [
      { label: 'En formation', value: stats.inTraining },
      { label: 'Femmes', value: stats.women },
      { label: 'Jeunes', value: stats.youth },
      { label: 'Inactifs', value: inactive > 0 ? inactive : 0 },
    ];
  }, [stats]);

  return (
    <Card className='bg-teal-600 text-white shadow-sm rounded-2xl border-0'>
      <CardContent className='p-6'>
        <div className='mb-4'>
          <p className='text-sm text-white/70 mb-1'>Repartition des beneficiaires</p>
          <span className='text-3xl font-bold text-white'>
            {isLoading ? '...' : (stats?.total ?? 0)}
          </span>
        </div>

        <div className='h-44'>
          {data.length > 0 ? (
            <ResponsiveContainer width='100%' height='100%'>
              <RechartsBarChart data={data} barCategoryGap='20%'>
                <XAxis
                  dataKey='label'
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.8)' }}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                  }}
                  formatter={(value: number) => [`${value}`, 'Beneficiaires']}
                />
                <Bar
                  dataKey='value'
                  fill='rgba(255, 255, 255, 0.9)'
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </RechartsBarChart>
            </ResponsiveContainer>
          ) : (
            <div className='flex h-full items-center justify-center text-sm text-white/60'>
              {isLoading ? 'Chargement...' : 'Aucune donnee'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
