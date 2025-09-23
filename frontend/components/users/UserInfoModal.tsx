'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type OrganizationUser from '@/types/OrganizationUser';

interface UserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeactivate: () => void;
  user: OrganizationUser;
}

export default function UserInfoModal({ isOpen, onClose, onDeactivate, user }: Readonly<UserInfoModalProps>) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold text-gray-900'>
            Informations de l&apos;utilisateur
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium text-gray-500'>Status</span>
            <Badge
              variant='secondary'
              className={
                user.status === 'Actif'
                  ? 'bg-green-100 text-green-700 hover:bg-green-100 border-0'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-100 border-0'
              }
            >
              {user.status}
            </Badge>
          </div>

          <div className='space-y-3'>
            <div>
              <span className='text-sm font-medium text-gray-500 block'>Nom et prénom</span>
              <span className='text-base text-gray-900'>{user.fullName}</span>
            </div>

            <div>
              <span className='text-sm font-medium text-gray-500 block'>Email</span>
              <span className='text-base text-gray-900'>{user.emailAddress}</span>
            </div>

            <div>
              <span className='text-sm font-medium text-gray-500 block'>Téléphone</span>
              <span className='text-base text-gray-900'>+221899089789</span>
            </div>

            <div>
              <span className='text-sm font-medium text-gray-500 block'>Type de compte</span>
              <span className='text-base text-gray-900 capitalize'>{user.role}</span>
            </div>
          </div>

          <div className='pt-4'>
            <Button
              onClick={onDeactivate}
              className='w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg'
            >
              Désactiver le compte
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
