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
import { useUpdateInstitutionStatus } from '@/hooks/institution/useUpdateInstitutionStatus';
import { type Institution, InstitutionStatus } from '@/types/Institution';

interface ConfirmUpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  refresh: () => void;
  institution: Institution;
  status: InstitutionStatus;
}

const ConfirmUpdateStatusModal = ({
  isOpen,
  onClose,
  refresh,
  institution,
  status,
}: ConfirmUpdateStatusModalProps) => {
  const { activateInstitution, deactivateInstitution } = useUpdateInstitutionStatus({
    onSuccess: () => {
      onClose();
      refresh();
    },
  });

  const onConfirm = () => {
    if (status === InstitutionStatus.ACTIVE) {
      activateInstitution(institution.id);
    }

    if (status === InstitutionStatus.INACTIVE) {
      deactivateInstitution(institution.id);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className='sm:max-w-md bg-white'>
        <AlertDialogHeader className='text-center'>
          <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 mb-4'>
            <AlertTriangle className='h-6 w-6 text-orange-600' />
          </div>
          <AlertDialogTitle className='text-xl font-semibold text-secondary-300'>
            Attention
          </AlertDialogTitle>
          <AlertDialogDescription className='text-base text-tertiary-300 mt-2'>
            Vous allez {status === InstitutionStatus.ACTIVE ? 'activer' : 'désactiver'}{' '}
            l&apos;institution{' '}
            <span className='font-medium text-tertiary-400'>{institution.name}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='flex-row justify-center space-x-4 mt-6'>
          <AlertDialogCancel className='px-6 py-2 text-tertiary-400 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg'>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={`px-6 py-2 ${status === InstitutionStatus.ACTIVE ? 'bg-primary-300 hover:bg-primary-400' : 'bg-red-500 hover:bg-red-600'} text-white rounded-lg`}
          >
            {status === InstitutionStatus.ACTIVE ? 'Activer' : 'Désactiver'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmUpdateStatusModal;
