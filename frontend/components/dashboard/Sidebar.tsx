'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { LogOut, AlertTriangle, Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';

import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUserRoles } from '@/hooks/useUserRoles';
import { menuItems, getAllowedRolesForPath } from '@/types/utils/menu-items';
import {
  getStoredNotifications,
  NOTIFICATIONS_UPDATED_EVENT,
} from '@/types/utils/notifications-data';

const BENEFICIARY_ROLES = ['org:recipient', 'beneficiary'];

export function isBeneficiaryOnlyRoute(allowedRoles: string[] | undefined): boolean {
  if (!allowedRoles || allowedRoles.length === 0) return false;
  return allowedRoles.every(r => BENEFICIARY_ROLES.includes(r));
}

export function canAccessItem(
  allowedRoles: string[] | undefined,
  hasRole: (r: string) => boolean,
  hasOrganizationRole: (r: string) => boolean,
  isFallbackUtilisateur: boolean
): boolean {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (isFallbackUtilisateur && isBeneficiaryOnlyRoute(allowedRoles)) return true;
  return allowedRoles.some(r => {
    if (r === 'admin') return hasRole('admin');
    if (BENEFICIARY_ROLES.includes(r)) {
      return hasOrganizationRole(r) || hasOrganizationRole(r.replace(/^org:/, '')) || hasRole(r);
    }
    return hasOrganizationRole(r) || hasOrganizationRole(r.replace(/^org:/, ''));
  });
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const { roleLabel, hasRole, hasOrganizationRole, isLoaded, userRoles, organizationRoles } =
    useUserRoles();

  const isFallbackUtilisateur =
    isLoaded && userRoles.length === 0 && organizationRoles.length === 0;

  const filteredMenuItems = useMemo(
    () =>
      menuItems.filter(item =>
        canAccessItem(item.allowedRoles, hasRole, hasOrganizationRole, isFallbackUtilisateur)
      ),
    [hasRole, hasOrganizationRole, isFallbackUtilisateur]
  );

  useEffect(() => {
    if (!isLoaded || !pathname) return;
    const allowedRoles = getAllowedRolesForPath(pathname);
    if (allowedRoles == null) return;
  }, [isLoaded, pathname, hasRole, hasOrganizationRole, router, isFallbackUtilisateur]);

  // États pour le mobile et la déconnexion
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const userName = user?.fullName || user?.firstName || 'Utilisateur';
  const userEmail = user?.emailAddresses?.[0]?.emailAddress || '';
  const userInitials = user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0] || 'U';

  const toggleSidebar = () => setIsOpen(!isOpen);

  useEffect(() => {
    const syncUnreadCount = () => {
      const unreadCount = getStoredNotifications().filter(
        notification => !notification.isRead
      ).length;
      setUnreadNotificationsCount(unreadCount);
    };

    syncUnreadCount();
    window.addEventListener('storage', syncUnreadCount);
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, syncUnreadCount);

    return () => {
      window.removeEventListener('storage', syncUnreadCount);
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, syncUnreadCount);
    };
  }, []);

  const handleConfirmLogout = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const SidebarContent = () => (
    <div className='flex h-full flex-col bg-white'>
      {/* Logo Section */}
      <div className='flex items-center justify-between border-b border-gray-100 p-6'>
        <Image
          src='/logo.svg'
          alt='Finance4All'
          width={120}
          height={32}
          className='h-8 w-auto'
          priority
        />
        <button
          onClick={toggleSidebar}
          className='rounded-md p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden'
        >
          <X className='h-5 w-5' />
        </button>
      </div>

      {/* User Profile */}
      <div className='border-b border-gray-100 p-6'>
        <div className='mb-3 flex items-center space-x-3'>
          <Avatar className='h-10 w-10'>
            <AvatarImage src={user?.imageUrl} alt={userName} />
            <AvatarFallback className='bg-teal-500 font-semibold text-white'>
              {userInitials.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-semibold text-gray-900'>{userName}</p>
            <p className='truncate text-xs text-gray-500'>{userEmail}</p>
          </div>
        </div>
        <Badge className='rounded-full border-0 bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700 hover:bg-purple-100'>
          {roleLabel}
        </Badge>
      </div>

      {/* Navigation */}
      <nav className='flex-1 overflow-y-auto px-4 py-4 space-y-1'>
        {filteredMenuItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link key={item.id} href={item.href} onClick={() => setIsOpen(false)}>
              <Button
                variant='ghost'
                className={`h-11 w-full justify-start cursor-pointer rounded-xl px-4 transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-300 text-white hover:bg-primary-400 shadow-xl hover:text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon
                  className={`mr-3 h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`}
                />
                <span className='text-sm font-medium'>{item.label}</span>
                {item.id === 'notifications' && unreadNotificationsCount > 0 && (
                  <span
                    className={`ml-auto inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-bold ${
                      isActive ? 'bg-white text-primary-400' : 'bg-primary-400 text-white'
                    }`}
                  >
                    {unreadNotificationsCount}
                  </span>
                )}
                {item.id !== 'notifications' && item.badge && (
                  <span className='ml-auto inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-gray-100 px-1.5 text-xs font-semibold text-gray-600'>
                    {item.badge}
                  </span>
                )}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className='border-t border-gray-100 p-4'>
        <Button
          variant='ghost'
          onClick={() => setShowLogoutDialog(true)}
          className='h-10 w-full justify-start rounded-md px-4 text-red-600 hover:bg-red-50 hover:text-red-700'
        >
          <LogOut className='mr-3 h-4 w-4 shrink-0' />
          <span className='text-sm font-medium'>Déconnexion</span>
        </Button>
        <p className='mt-4 text-center text-[10px] uppercase tracking-wider text-gray-400'>
          Version v1.0
        </p>
      </div>
    </div>
  );

  return (
    <>
      <div className='fixed top-4 left-4 z-40 lg:hidden'>
        <Button
          onClick={toggleSidebar}
          variant='outline'
          size='icon'
          className='bg-white shadow-md'
        >
          <Menu className='h-5 w-5' />
        </Button>
      </div>

      <div className={`fixed inset-0 z-50 lg:hidden ${isOpen ? 'visible' : 'invisible'}`}>
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          role='button'
          tabIndex={0}
          onClick={toggleSidebar}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleSidebar();
            }
          }}
          aria-label='Fermer le menu'
        />

        <aside
          className={`absolute inset-y-0 left-0 w-72 transform bg-white shadow-xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <SidebarContent />
        </aside>
      </div>

      <aside className='fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-gray-200 bg-white lg:flex lg:flex-col'>
        <SidebarContent />
      </aside>

      {/* Dialogue de déconnexion */}
      <ConfirmDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleConfirmLogout}
        title='Confirmer la déconnexion'
        description='Êtes-vous sûr de vouloir vous déconnecter ?'
        confirmButtonText='Déconnexion'
        icon={AlertTriangle}
        confirmButtonClassName='bg-red-600 hover:bg-red-700'
      />
    </>
  );
}
