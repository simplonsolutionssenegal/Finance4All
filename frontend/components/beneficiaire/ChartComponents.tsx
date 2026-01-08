// frontend/components/beneficiaire/ChartComponents.tsx
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

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  trend?: string;
  trendClassName?: string;
  trendUp?: boolean;
  bgColor?: string;
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
  trend,
  trendClassName = 'text-green-500',
  trendUp = true,
  bgColor = 'bg-white',
  iconBgColor = 'bg-blue-50',
  iconColor = 'text-blue-600',

  progress,
  progressColor = 'bg-emerald-500',
  showProgress = true,
}: StatCardProps) {
  const defaultTrendText = trendUp ? 'text-green-600' : 'text-red-600';
  const defaultTrendBg = trendUp ? 'bg-green-50' : 'bg-red-50';
  const safeProgress =
    typeof progress === 'number' ? Math.min(100, Math.max(0, progress)) : undefined;

  return (
    <Card
      className={`${bgColor} shadow-sm rounded-2xl border border-gray-100 hover:shadow-md transition-shadow`}
    >
      <CardContent className='p-6'>
        <div className='flex items-start justify-between mb-4'>
          <div className={`p-3 ${iconBgColor} rounded-xl`}>
            <div className={iconColor}>{icon}</div>
          </div>

          {trend && (
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                defaultTrendBg
              } ${trendClassName ?? defaultTrendText}`}
            >
              {trend}
            </span>
          )}
        </div>

        <div className='mt-1'>
          <h3 className='text-3xl font-bold text-gray-900 mb-1'>{value}</h3>
          <p className='text-sm text-gray-600'>{label}</p>
        </div>

        {/* ✅ Barre de progression (comme l’image) */}
        {showProgress && typeof safeProgress === 'number' && (
          <div className='mt-4 h-1.5 w-full rounded-full bg-gray-200 overflow-hidden'>
            <div
              className={`h-full rounded-full ${progressColor}`}
              style={{ width: `${safeProgress}%` }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface DonutChartProps {
  data: Array<{ name: string; value: number; color: string }>;
  title?: string;
  subtitle?: string;
  bgColor?: string;
  icon?: React.ReactNode;
}

export function DonutChart({
  data,
  title = 'Répartition des modules',
  subtitle = '',
  bgColor = 'bg-white',
  icon,
}: DonutChartProps) {
  const total = data.reduce((acc, item) => acc + item.value, 0);

  // dimensions proches de la capture
  const innerRadius = 52;
  const outerRadius = 70;

  return (
    <Card className={`${bgColor} shadow-sm rounded-2xl border border-gray-100`}>
      <CardContent className='p-6'>
        {/* Header */}
        <div className='flex items-start justify-between gap-3 mb-6'>
          <div>
            <h3 className='text-base font-semibold text-gray-900'>{title}</h3>
            {subtitle ? <p className='text-sm text-gray-500 mt-0.5'>{subtitle}</p> : null}
          </div>

          <div className='p-2.5 rounded-xl bg-emerald-50 text-emerald-600'>
            {icon ?? <Target className='h-4 w-4' />}
          </div>
        </div>

        {/* Body */}
        <div className='flex items-center justify-between gap-8'>
          {/* Donut */}
          <div className='relative h-[150px] w-[150px] shrink-0'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                {/* Track gris (anneau complet) */}
                <Pie
                  data={[{ name: 'track', value: total || 1 }]}
                  dataKey='value'
                  cx='50%'
                  cy='50%'
                  startAngle={90}
                  endAngle={-270}
                  innerRadius={innerRadius}
                  outerRadius={outerRadius}
                  fill='#e5e7eb'
                  stroke='none'
                  isAnimationActive={false}
                />

                {/* Segments */}
                <Pie
                  data={data}
                  dataKey='value'
                  cx='50%'
                  cy='50%'
                  startAngle={90}
                  endAngle={-270}
                  innerRadius={innerRadius}
                  outerRadius={outerRadius}
                  paddingAngle={3}
                  cornerRadius={8}
                  stroke='none'
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Légende (label à gauche / valeur à droite) */}
          <div className='w-full max-w-[260px] space-y-3'>
            {data.map((item, index) => (
              <div key={index} className='flex items-center justify-between gap-6'>
                <div className='flex items-center gap-3 min-w-0'>
                  <span
                    className='h-2.5 w-2.5 rounded-full shrink-0'
                    style={{ backgroundColor: item.color }}
                  />
                  <span className='text-sm text-gray-600 truncate'>{item.name}</span>
                </div>
                <span className='text-sm font-semibold text-gray-900 tabular-nums'>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface MonthlyProgressLineChartProps {
  data: Array<{ month: string; value: number }>;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

function GrowthTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className='rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-md'>
      <div className='text-xs font-medium text-gray-900'>{label}</div>
      <div className='text-xs text-gray-600'>
        <span className='font-semibold text-gray-900'>{payload[0].value}</span>
      </div>
    </div>
  );
}

export function MonthlyProgressLineChart({
  data,
  title = 'Progression mensuelle',
  subtitle = 'Évolution de votre apprentissage',
  icon,
}: MonthlyProgressLineChartProps) {
  const max = Math.max(...data.map(d => d.value));
  const yMax = Math.ceil((max + 5) / 10) * 10; // arrondi joli

  return (
    <Card className='bg-white shadow-sm rounded-2xl border border-gray-100'>
      <CardContent className='p-6'>
        {/* Header comme ta capture */}
        <div className='flex items-start justify-between gap-3 mb-4'>
          <div>
            <h3 className='text-base font-semibold text-gray-900'>{title}</h3>
            <p className='text-sm text-gray-500 mt-0.5'>{subtitle}</p>
          </div>

          <div className='p-2.5 rounded-xl bg-sky-50 text-sky-600'>
            {icon ?? <BarChart3 className='h-4 w-4' />}
          </div>
        </div>

        {/* Chart */}
        <div className='h-[210px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id='progressFill' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='0%' stopColor='#38bdf8' stopOpacity={0.18} />
                  <stop offset='100%' stopColor='#38bdf8' stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke='#e5e7eb' strokeDasharray='4 4' vertical={false} />

              <XAxis
                dataKey='month'
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                dy={8}
              />

              <YAxis
                domain={[0, yMax]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                width={28}
              />

              <Tooltip content={<GrowthTooltip />} cursor={{ strokeDasharray: '4 4' }} />

              <Area
                type='monotone'
                dataKey='value'
                stroke='#38bdf8'
                strokeWidth={2.5}
                fill='url(#progressFill)'
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
