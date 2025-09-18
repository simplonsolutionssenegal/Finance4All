'use client';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <SidebarProvider>
      <div className='flex min-h-screen'>
        <AdminSidebar />
        <div className='flex-1 overflow-auto'>
          <div className='p-4 md:p-6'>{children}</div>
        </div>
      </div>
    </SidebarProvider>
  );
}
