import type React from 'react';

import PublicFooter from '@/components/public/layout/footer';
import PublicHeader from '@/components/public/layout/header';

export default function PublicLayout({ children } : Readonly<{ children: React.ReactNode;}>) {
  return (<div>
    <PublicHeader />
    <main className="min-h-screen">{children}</main>
    <PublicFooter />
  </div>)
}
