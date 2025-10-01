// frontend/components/products/ConfirmDeleteModal.tsx

'use client';

import { AlertTriangle } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import type { Product } from '@/types/Product';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  product: Product;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  product,
}: Readonly<ConfirmDeleteModalProps>) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center w-12 h-12 rounded-full bg-red-100'>
              <AlertTriangle className='w-6 h-6 text-red-600' />
            </div>
            <div>
              <AlertDialogTitle className='text-lg font-semibold text-gray-900'>
                Confirmer la suppression
              </AlertDialogTitle>
            </div>
          </div>
        </AlertDialogHeader>

        <AlertDialogDescription className='text-gray-600'>
          Êtes-vous sûr de vouloir supprimer le produit{' '}
          <span className='font-semibold text-gray-900'>{product.designation}</span> ?
          <br />
          <br />
          Cette action est <span className='font-semibold'>irréversible</span> et le produit sera
          définitivement supprimé de la base de données.
        </AlertDialogDescription>

        <AlertDialogFooter className='gap-2'>
          <Button variant='outline' onClick={onClose}>
            Annuler
          </Button>
          <Button variant='destructive' onClick={onConfirm}>
            Supprimer définitivement
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
