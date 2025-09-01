import SideNav from '@/components/sidenav';
import Header from '@/components/header';
import type React from 'react';

export default function AuthLayout({ children } : Readonly<{ children: React.ReactNode;}>) {
  return (
    <div className="flex h-screen flex-col">
      {/* Header global */}
      <Header />
      
      {/* Contenu principal avec sidebar */}
      <div className="flex flex-1 overflow-hidden  m-2">
        <div className="w-full flex-none md:w-64">
          <SideNav />
        </div>
        <main className="flex-1 overflow-y-auto p-2 ">{children}</main>
      </div>
    </div>
  );
}