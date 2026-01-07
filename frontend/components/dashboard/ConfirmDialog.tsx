'use client';

import type { LucideIcon } from 'lucide-react';
import * as React from 'react';

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
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string | React.ReactNode;
  confirmButtonText: string;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  iconBgColor?: string;
  iconColor?: string;
  confirmButtonClassName?: string;
  isLoading?: boolean;
  loadingText?: string;
  cancelButtonText?: string;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmButtonText,
  icon: Icon,
  iconBgColor = 'bg-orange-100',
  iconColor = 'text-orange-600',
  confirmButtonClassName,
  isLoading: externalIsLoading = false,
  loadingText,
  cancelButtonText = 'Annuler',
}: ConfirmDialogProps) {
  const [internalLoading, setInternalLoading] = React.useState(false);
  const isLoading = externalIsLoading || internalLoading;

  const handleConfirm = async () => {
    setInternalLoading(true);
    try {
      await onConfirm();
      // Si l'opération réussit, fermer le dialog
      onClose();
    } catch (error) {
      // Si l'opération échoue, garder le dialog ouvert
      console.error('Erreur lors de la confirmation:', error);
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className='sm:max-w-sm border-0 rounded-2xl shadow-lg'>
        <AlertDialogHeader className='text-center'>
          {Icon && (
            <div
              className={cn(
                'mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-4',
                iconBgColor
              )}
            >
              <Icon className={cn('h-8 w-8', iconColor)} />
            </div>
          )}
          <AlertDialogTitle className='text-xl font-semibold text-gray-900 text-center'>
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className='text-base text-gray-700 mt-2 text-center'>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='flex-col sm:flex-row gap-3 w-full mt-6 sm:justify-center'>
          <AlertDialogCancel
            onClick={onClose}
            disabled={isLoading}
            className='w-full sm:w-auto flex-1 px-6 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg cursor-pointer'
          >
            {cancelButtonText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              'w-full sm:w-auto flex-1 px-6 py-2 text-white rounded-lg cursor-pointer',
              confirmButtonClassName || 'bg-red-600 hover:bg-red-700'
            )}
          >
            {isLoading ? (
              <span className='flex items-center justify-center gap-2'>
                <span className='inline-flex size-4 animate-spin rounded-full border-2 border-white border-b-transparent' />
                <span>{loadingText || 'Chargement...'}</span>
              </span>
            ) : (
              confirmButtonText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
