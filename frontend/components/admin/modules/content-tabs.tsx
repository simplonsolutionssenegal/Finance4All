'use client';

import { BookOpen, CheckSquare } from 'lucide-react';
import { useState } from 'react';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

type TabValue = 'modules' | 'quiz';

interface ContentTabsProps {
  children: (activeTab: TabValue) => React.ReactNode;
}

export default function ContentTabs({ children }: ContentTabsProps) {
  const [activeTab, setActiveTab] = useState<TabValue>('modules');

  const tabs = [
    {
      value: 'modules' as const,
      label: 'Modules',
      icon: BookOpen,
    },
    {
      value: 'quiz' as const,
      label: 'Quiz',
      icon: CheckSquare,
    },
  ];

  return (
    <div>
      <Tabs
        defaultValue='modules'
        onValueChange={value => setActiveTab(value as TabValue)}
        className='w-full'
      >
        {/* Tabs List */}
        <TabsList className='w-full justify-start bg-gray-100 p-1 rounded-full gap-1 mb-6'>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className='group flex items-center justify-center gap-2 rounded-full px-6 py-2 text-sm font-medium
                  text-gray-600 hover:text-gray-900 data-[state=active]:bg-white
                  data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all flex-1'
              >
                <Icon className='h-5 w-5 text-gray-600 group-data-[state=active]:text-gray-900' />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Modules Content */}
        <TabsContent value='modules' className='mt-0'>
          {activeTab === 'modules' && children('modules')}
        </TabsContent>

        {/* Quiz Content */}
        <TabsContent value='quiz' className='mt-0'>
          {activeTab === 'quiz' && children('quiz')}
        </TabsContent>
      </Tabs>
    </div>
  );
}
