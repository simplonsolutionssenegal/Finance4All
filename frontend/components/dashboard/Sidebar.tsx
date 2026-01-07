'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { LogOut, ChevronLeft, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUserRoles } from '@/hooks/useUserRoles';
import { menuItems } from '@/types/utils/menu-items';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const { roleLabel } = useUserRoles();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const userName = user?.fullName || user?.firstName || 'Utilisateur';
  const userEmail = user?.emailAddresses?.[0]?.emailAddress || '';
  const userInitials = user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0] || 'U';

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  };

  return (
    <aside className='w-64 h-full bg-white border-r border-gray-200 flex flex-col'>
      {/* Logo Section */}
      <div className='p-6 border-b border-gray-100'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Image
              src='/logo.svg'
              alt='Finance4All'
              width={120}
              height={32}
              className='h-8 w-auto'
              priority
            />
          </div>
          <button
            type='button'
            className='p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700'
            aria-label='Collapse sidebar'
          >
            <ChevronLeft className='w-4 h-4' />
          </button>
        </div>
      </div>

      {/* User Profile Section */}
      <div className='p-6 border-b border-gray-100'>
        <div className='flex items-center space-x-3 mb-3'>
          <Avatar className='w-10 h-10'>
            <AvatarImage src={user?.imageUrl} alt={userName} />
            <AvatarFallback className='bg-teal-500 text-white font-semibold text-sm'>
              {userInitials.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-semibold text-gray-900 truncate'>{userName}</p>
            <p className='text-xs text-gray-500 truncate'>{userEmail}</p>
          </div>
        </div>
        <Badge
          variant='secondary'
          className='bg-purple-100 text-purple-700 hover:bg-purple-100 border-0 rounded-full px-2.5 py-0.5 text-xs font-medium w-fit'
        >
          {roleLabel}
        </Badge>
      </div>

      {/* Navigation Menu */}
      <nav className='flex-1 px-4 py-4 space-y-0.5 overflow-y-auto'>
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

          return (
            <Link key={item.id} href={item.href}>
              <Button
                variant='ghost'
                className={`w-full justify-start h-11 px-4 rounded-lg transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-primary-300 text-white font-medium hover:bg-primary-300 hover:text-white'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon
                  className={`w-5 h-5 mr-3 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500'}`}
                />
                <span className='flex-1 text-left text-sm'>{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Footer Section */}
      <div className='mt-auto border-t border-gray-100 pt-4 pb-4'>
        <div className='px-4 mb-3'>
          <Button
            variant='ghost'
            onClick={handleLogoutClick}
            className='w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md h-10 px-4 cursor-pointer'
          >
            <LogOut className='w-4 h-4 mr-3 flex-shrink-0' />
            <span className='text-sm font-medium'>Déconnexion</span>
          </Button>
        </div>
        <div className='px-4'>
          <p className='text-xs text-gray-400 text-center'>Version Finance4All v1.0</p>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleConfirmLogout}
        title='Confirmer la déconnexion'
        description='Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à nouveau à votre compte.'
        confirmButtonText='Déconnexion'
        icon={AlertTriangle}
        iconBgColor='bg-red-100'
        iconColor='text-red-600'
        confirmButtonClassName='bg-red-600 hover:bg-red-700'
        loadingText='Déconnexion...'
      />
    </aside>
  );
}
