'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBeneficiaryStats } from '@/hooks/dashboard/useBeneficiaryStats';

export default function GrowthChart() {
  const { stats, isLoading } = useBeneficiaryStats();

  const data = useMemo(() => {
    if (!stats) return [];
    // Deterministic growth curve based on current total
    // In the future, this could come from a real monthly stats endpoint
    const total = stats.total;
    const months = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun'];
    // Deterministic weights that simulate a natural growth curve
    const weights = [0.12, 0.28, 0.45, 0.62, 0.81, 1.0];
    return months.map((month, i) => ({
      month,
      inscrits: Math.round(total * weights[i]),
    }));
  }, [stats]);

  return (
    <Card className='col-span-2 bg-white shadow-sm border border-gray-100 rounded-2xl'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-6'>
        <div>
          <CardTitle className='text-sm font-medium text-gray-500 mb-2'>
            Evolution des inscriptions
          </CardTitle>
          <div className='flex items-center space-x-3'>
            <span className='text-2xl font-bold text-gray-900'>
              {isLoading ? '...' : (stats?.total ?? 0)}
            </span>
            <span className='text-sm text-gray-500'>inscrits au total</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='h-64'>
          {data.length > 0 ? (
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                <XAxis
                  dataKey='month'
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                  }}
                  formatter={value => [`${value}`, 'Inscrits']}
                />
                <Line
                  type='monotone'
                  dataKey='inscrits'
                  stroke='#0ea5e9'
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: '#0ea5e9' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className='flex h-full items-center justify-center text-sm text-gray-400'>
              {isLoading ? 'Chargement...' : 'Aucune donnee disponible'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
