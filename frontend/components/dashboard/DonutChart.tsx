'use client';

import { MoreHorizontal } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const data = [
  { name: 'Lorem ipsum', value: 65345.0, color: '#1f2937' },
  { name: 'Lorem ipsum', value: 25345.0, color: '#10b981' },
  { name: 'Lorem ipsum', value: 22330.0, color: '#6b7280' },
];

export default function DonutChart() {
  return (
    <Card className='bg-white shadow-sm border border-gray-100 rounded-2xl'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium text-gray-500'>Lorem ipsum</CardTitle>
        <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
          <MoreHorizontal className='w-4 h-4 text-gray-400' />
        </Button>
      </CardHeader>
      <CardContent className='pb-6'>
        <div className='flex flex-col items-center space-y-6'>
          <div className='relative w-40 h-40'>
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
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index + 1}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='text-center'>
                <div className='text-xl font-bold text-gray-900'>112,452.20</div>
              </div>
            </div>
          </div>

          <div className='space-y-4 w-full'>
            {data.map(item => (
              <div key={item.name} className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  <div className='w-3 h-3 rounded-full' style={{ backgroundColor: item.color }} />
                  <span className='text-sm text-gray-600'>{item.name}</span>
                </div>
                <span className='text-sm font-semibold text-gray-900'>
                  {item.value.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
