import type React from 'react';

import Header from '@/components/admin/header';

import SideNav from '../../../components/admin/SideNav';

export default function AuthLayout({ children } : Readonly<{ children: React.ReactNode;}>) {
  return (
    <div className="flex h-screen flex-col">
      {/* Header global */}
      <Header />
      
      {/* Contenu principal avec sidebar */}
      <div className="flex flex-1 overflow-hidden  m-4">
        <div className="w-full flex-none md:w-64">
          <SideNav />
        </div>
        <main className="flex-1 overflow-y-auto p-2 ">{children}</main>
      </div>
    </div>
  );
}