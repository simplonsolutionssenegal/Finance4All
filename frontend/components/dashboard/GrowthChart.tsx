'use client';

import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const data = [
  { month: 'JAN', value: 10000 },
  { month: 'FEB', value: 15000 },
  { month: 'MAR', value: 12000 },
  { month: 'APR', value: 20000 },
  { month: 'MAY', value: 18000 },
  { month: 'JUN', value: 25000 },
  { month: 'JUL', value: 22000 },
];

const timeFilters = [
  { id: '1D', label: '1D' },
  { id: '1W', label: '1W' },
  { id: '1M', label: '1M', active: true },
  { id: '6M', label: '6M' },
  { id: '1Y', label: '1Y' },
];

export default function GrowthChart() {
  const [activeFilter, setActiveFilter] = useState('1M');

  return (
    <Card className='col-span-2 bg-white shadow-sm border border-gray-100 rounded-2xl'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-6'>
        <div>
          <CardTitle className='text-sm font-medium text-gray-500 mb-2'>Lorem ipsum</CardTitle>
          <div className='flex items-center space-x-3'>
            <span className='text-2xl font-bold text-gray-900'>134,640.00</span>
            <Badge className='bg-green-100 text-green-700 hover:bg-green-100 rounded-full px-3 py-1'>
              📈 13% growth
            </Badge>
          </div>
        </div>
        <div className='flex items-center space-x-2'>
          <div className='flex space-x-1 bg-gray-50 rounded-lg p-1'>
            {timeFilters.map(filter => (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? 'secondary' : 'ghost'}
                size='sm'
                className={`text-xs px-3 py-1 h-8 ${
                  activeFilter === filter.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
          <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
            <MoreHorizontal className='w-4 h-4 text-gray-400' />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className='h-64'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
              <XAxis
                dataKey='month'
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={value => `${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                }}
                formatter={value => [
                  `${typeof value === 'number' ? value.toLocaleString() : (value ?? 0)}`,
                  'Value',
                ]}
              />
              <Line
                type='monotone'
                dataKey='value'
                stroke='#0ea5e9'
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: '#0ea5e9' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
