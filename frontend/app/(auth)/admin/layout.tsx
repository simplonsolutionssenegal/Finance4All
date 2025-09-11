'use client';

import {
  Building2Icon,
  BarChart3Icon,
  Users2Icon,
  ShieldIcon,
  CreditCardIcon,
  FileTextIcon,
  SettingsIcon,
} from 'lucide-react';
import { usePathname } from 'next/navigation';

import { SidebarMenuItemLink } from '@/components/admin/institution-financiere/sidebar-menu-item-link';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className='flex min-h-screen'>
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Finance4All Admin</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuItemLink
                      href='/admin/dashboard'
                      active={pathname === '/admin/dashboard'}
                      icon={<BarChart3Icon className='h-4 w-4' />}
                    >
                      Tableau de bord
                    </SidebarMenuItemLink>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuItemLink
                      href='/admin/institution-financiere'
                      active={pathname === '/admin/institution-financiere'}
                      icon={<Building2Icon className='h-4 w-4' />}
                    >
                      Institutions financières
                    </SidebarMenuItemLink>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuItemLink
                      href='/admin/users'
                      active={pathname === '/admin/users'}
                      icon={<Users2Icon className='h-4 w-4' />}
                    >
                      Utilisateurs
                    </SidebarMenuItemLink>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuItemLink
                      href='/admin/roles'
                      active={pathname === '/admin/roles'}
                      icon={<ShieldIcon className='h-4 w-4' />}
                    >
                      Rôles et permissions
                    </SidebarMenuItemLink>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuItemLink
                      href='/admin/produits'
                      active={pathname === '/admin/produits'}
                      icon={<CreditCardIcon className='h-4 w-4' />}
                    >
                      Produits financiers
                    </SidebarMenuItemLink>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuItemLink
                      href='/admin/content'
                      active={pathname === '/admin/content'}
                      icon={<FileTextIcon className='h-4 w-4' />}
                    >
                      Gestion de contenu
                    </SidebarMenuItemLink>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuItemLink
                      href='/admin/settings'
                      active={pathname === '/admin/settings'}
                      icon={<SettingsIcon className='h-4 w-4' />}
                    >
                      Paramètres
                    </SidebarMenuItemLink>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <div className='flex-1 overflow-auto'>
          <div className='p-4 md:p-6'>{children}</div>
        </div>
      </div>
    </SidebarProvider>
  );
}
