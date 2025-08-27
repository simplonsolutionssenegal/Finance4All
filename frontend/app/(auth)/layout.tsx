import type React from 'react';

export default function AuthLayout({ children } : Readonly<{ children: React.ReactNode;}>) {
  return (<div>
    <main className="min-h-screen">{children}</main>
  </div>)
}
