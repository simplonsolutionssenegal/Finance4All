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
}

export default function ConfirmDesactivationModal({
  isOpen,
  onClose,
  onConfirm,
  user,
}: ConfirmDesactivationModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className='sm:max-w-md'>
        <AlertDialogHeader className='text-center'>
          <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 mb-4'>
            <AlertTriangle className='h-6 w-6 text-orange-600' />
          </div>
          <AlertDialogTitle className='text-xl font-semibold text-gray-900'>
            Attention
          </AlertDialogTitle>
          <AlertDialogDescription className='text-base text-gray-700 mt-2'>
            Vous allez désactiver le compte de l&apos;utilisateur{' '}
            <span className='font-medium text-gray-900'>
              {user.fullName} ({user.emailAddress})
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='flex-row justify-center space-x-4 mt-6'>
          <AlertDialogCancel
            onClick={onClose}
            className='px-6 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg'
          >
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className='px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg'
          >
            Désactiver
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
