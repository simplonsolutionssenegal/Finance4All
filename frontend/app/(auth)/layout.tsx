'use client';
import { usePathname } from 'next/navigation';
import type React from 'react';

import Sidebar from '@/components/dashboard/Sidebar';

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const isLearningLessonDetail = /^\/learning\/[^/]+\/lesson\/[^/]+$/.test(pathname);
  const isLearningQuizDetail = /^\/learning\/[^/]+\/quiz\/[^/]+$/.test(pathname);
  const isLearningDetailScreen = isLearningLessonDetail || isLearningQuizDetail;

  if (isLearningDetailScreen) {
    return <div className='min-h-screen bg-grey-50'>{children}</div>;
  }

  return (
    <div className='h-screen bg-gray-50 flex overflow-hidden'>
      <Sidebar />
      <main className='flex-1 overflow-auto p-6'>{children}</main>
    </div>
  );
}
