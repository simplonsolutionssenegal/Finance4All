import { AlertTriangle } from 'lucide-react';
import type { ReactNode } from 'react';

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

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description: ReactNode;
  confirmLabel?: string;
  confirmClassName?: string;
}

const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Attention',
  description,
  confirmLabel = 'Supprimer',
  confirmClassName = 'bg-red-500 hover:bg-red-600',
}: ConfirmDeleteModalProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className='sm:max-w-md bg-white'>
        <AlertDialogHeader className='text-center'>
          <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 mb-2'>
            <AlertTriangle className='h-6 w-6 text-orange-600' />
          </div>
          <AlertDialogTitle className='text-xl font-semibold text-secondary-300'>
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className='text-base text-tertiary-300 mt-2'>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='flex-row justify-center space-x-2 mt-2'>
          <AlertDialogCancel className='px-6 py-2 text-tertiary-400 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg'>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={`px-6 py-2 ${confirmClassName} text-white rounded-lg`}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDeleteModal;
