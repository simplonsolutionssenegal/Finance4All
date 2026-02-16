'use client';

import { BarChart3, Target } from 'lucide-react';
import React from 'react';
import {
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
} from 'recharts';

import { Card, CardContent } from '@/components/ui/card';

// --- STAT CARD ---
type TrendTagVariant = 'green' | 'grey';

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  trend?: string;
  trendUp?: boolean;
  trendVariant?: TrendTagVariant;
  iconBgColor?: string;
  iconColor?: string;
  progress?: number;
  progressColor?: string;
  showProgress?: boolean;
}

export function StatCard({
  icon,
  value,
  label,
  trend = '',
  trendUp = true,
  trendVariant = 'green',
  iconBgColor = 'bg-blue-50',
  iconColor = 'text-blue-600',
  progress,
  progressColor = 'bg-emerald-500',
  showProgress = true,
}: StatCardProps) {
  const safeProgress = Math.min(100, Math.max(0, progress ?? 0));
  const trendTagClass =
    trendVariant === 'grey'
      ? 'bg-gray-100 text-gray-700'
      : trendUp
        ? 'bg-green-50 text-green-600'
        : 'bg-red-50 text-red-600';

  return (
    <Card className='bg-white shadow-sm rounded-2xl border border-gray-100 hover:shadow-md transition-all duration-200'>
      <CardContent className='p-5 sm:p-6'>
        <div className='flex items-start justify-between mb-4'>
          <div className={`p-3 rounded-xl ${iconBgColor} ${iconColor}`}>{icon}</div>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${trendTagClass}`}
          >
            {trend}
          </span>
        </div>

        <div>
          <h3 className='text-2xl sm:text-3xl font-bold text-gray-900 mb-1'>{value}</h3>
          <p className='text-sm font-medium text-gray-500'>{label}</p>
        </div>

        {showProgress && (
          <div className='mt-5'>
            <div className='h-1.5 w-full bg-gray-100 rounded-full overflow-hidden'>
              <div
                className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                style={{ width: `${safeProgress}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// --- DONUT CHART ---
export interface DonutChartSegment {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartSegment[];
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

const DEFAULT_DONUT_DATA: DonutChartSegment[] = [
  { name: 'Complétés', value: 0, color: '#2ECC71' },
  { name: 'En cours', value: 0, color: '#93C5FD' },
  { name: 'Non commencés', value: 0, color: '#E5E7EB' },
];

export function DonutChart({ data, title, subtitle, icon }: DonutChartProps) {
  const safeData = data?.length ? data : DEFAULT_DONUT_DATA;
  return (
    <Card className='bg-white shadow-sm rounded-2xl border border-gray-100'>
      <CardContent className='p-6'>
        <div className='flex items-start justify-between mb-8'>
          <div>
            <h3 className='text-base sm:text-lg font-bold text-gray-900'>{title}</h3>
            <p className='text-sm text-gray-500'>{subtitle}</p>
          </div>
          <div className='p-2.5 rounded-xl bg-emerald-50 text-emerald-600'>
            {icon ?? <Target className='w-5 h-5' />}
          </div>
        </div>

        {/* Layout responsive: colonne sur mobile, ligne sur desktop */}
        <div className='flex flex-col sm:flex-row items-center justify-between gap-8'>
          <div className='w-[160px] h-[160px] shrink-0'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Pie
                  data={safeData}
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey='value'
                  cornerRadius={6}
                  stroke='none'
                >
                  {safeData.map((entry: DonutChartSegment, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className='w-full space-y-3'>
            {safeData.map((item: DonutChartSegment, index: number) => (
              <div key={index} className='flex items-center justify-between group'>
                <div className='flex items-center gap-3'>
                  <div
                    className='w-2.5 h-2.5 rounded-full'
                    style={{ backgroundColor: item.color }}
                  />
                  <span className='text-sm text-gray-600 group-hover:text-gray-900 transition-colors'>
                    {item.name}
                  </span>
                </div>
                <span className='text-sm font-bold text-gray-900'>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- LINE CHART ---
export function MonthlyProgressLineChart({ data, title, subtitle, icon }: any) {
  return (
    <Card className='bg-white shadow-sm rounded-2xl border border-gray-100'>
      <CardContent className='p-6'>
        <div className='flex items-start justify-between mb-8'>
          <div>
            <h3 className='text-base sm:text-lg font-bold text-gray-900'>{title}</h3>
            <p className='text-sm text-gray-500'>{subtitle}</p>
          </div>
          <div className='p-2.5 rounded-xl bg-sky-50 text-sky-600'>
            {icon ?? <BarChart3 className='w-5 h-5' />}
          </div>
        </div>

        <div className='h-[250px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id='colorProgress' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#0ea5e9' stopOpacity={0.15} />
                  <stop offset='95%' stopColor='#0ea5e9' stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#f1f5f9' />
              <XAxis
                dataKey='month'
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                dy={10}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
              />
              <Area
                type='monotone'
                dataKey='value'
                stroke='#0ea5e9'
                strokeWidth={3}
                fillOpacity={1}
                fill='url(#colorProgress)'
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
