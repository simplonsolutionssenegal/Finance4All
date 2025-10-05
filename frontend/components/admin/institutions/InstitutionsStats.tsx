'use client';

import { Archive, Clock, CheckCircle2 } from 'lucide-react';

const InstitutionStats = () => {
  const stats = [
    {
      title: 'Terminer',
      value: '12,350',
      change: '7,332 Lorem ipsum',
      icon: Archive,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-50',
      trend: 'up',
    },
    {
      title: 'En cours',
      value: '134,640.00',
      change: '13% Lorem ipsum',
      icon: Clock,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-50',
      trend: 'up',
    },
    {
      title: 'En attente',
      value: '134,640.00',
      change: '13% Lorem ipsum',
      icon: CheckCircle2,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-50',
      trend: 'up',
    },
  ];

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
      {stats.map(stat => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow'
          >
            <div className='flex items-start justify-between mb-4'>
              <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                <Icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <button className='text-gray-400 hover:text-gray-600'>
                <svg width='4' height='16' viewBox='0 0 4 16' fill='currentColor' className='w-1'>
                  <circle cx='2' cy='2' r='2' />
                  <circle cx='2' cy='8' r='2' />
                  <circle cx='2' cy='14' r='2' />
                </svg>
              </button>
            </div>
            <h3 className='text-gray-500 text-sm font-medium mb-2'>{stat.title}</h3>
            <div className='flex items-end justify-between'>
              <p className='text-3xl font-bold text-gray-900'>{stat.value}</p>
            </div>
            <div className='flex items-center mt-2 text-sm'>
              {stat.trend === 'up' && <span className='text-green-500 mr-1'>●</span>}
              <span className='text-gray-500'>{stat.change}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InstitutionStats;
