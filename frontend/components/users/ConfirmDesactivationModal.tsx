'use client';

import { AlertTriangle } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type OrganizationUser from '@/types/OrganizationUser';

interface ConfirmDesactivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: OrganizationUser;
  isDeleting?: boolean;
}

export default function ConfirmDesactivationModal({
  isOpen,
  onClose,
  onConfirm,
  user,
  isDeleting = false,
}: Readonly<ConfirmDesactivationModalProps>) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className='sm:max-w-sm border-0 rounded-2xl p-6 pb-6'>
        <AlertDialogHeader className='text-center space-y-6'>
          <div className='mx-auto flex p-6 items-center justify-center rounded-full bg-orange-100'>
            <AlertTriangle className='h-6 w-6 text-orange-600' />
          </div>
          <div className='space-y-3'>
            <AlertDialogTitle className='text-2xl text-center font-bold text-gray-900'>
              Attention
            </AlertDialogTitle>
            <AlertDialogDescription className='text-base text-center text-gray-700 leading-relaxed'>
              Vous allez supprimer le compte de l&apos;utilisateur{' '}
              <span className='font-medium text-gray-900'>
                {user.fullName} ({user.emailAddress})
              </span>
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className='flex-row justify-center items-center gap-3 mt-8 sm:mt-10'>
          <AlertDialogCancel
            onClick={onClose}
            className='flex-1 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer px-6 py-2.5'
            disabled={isDeleting}
          >
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className='flex-1 bg-orange-500 hover:bg-orange-600 text-white cursor-pointer px-6 py-2.5'
            disabled={isDeleting}
          >
            {isDeleting ? (
              <span className='flex items-center justify-center gap-2'>
                <span className='inline-flex size-4 animate-spin rounded-full border-2 border-white border-b-transparent' />
                <span>Suppression...</span>
              </span>
            ) : (
              'Supprimer'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
