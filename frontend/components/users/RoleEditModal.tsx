'use client';

import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUpdateUserRole } from '@/lib/clerk-utils';
import type OrganizationUser from '@/types/OrganizationUser';

interface RoleEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: OrganizationUser | null;
}

const AVAILABLE_ROLES = [
  { value: 'org:member', label: 'Member' },
  { value: 'org:admin', label: 'Admin' },
];

export default function RoleEditModal({ isOpen, onClose, user }: RoleEditModalProps) {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateUserRole } = useUpdateUserRole();

  // Réinitialiser le rôle sélectionné quand l'utilisateur change
  useEffect(() => {
    if (user) {
      setSelectedRole(''); // Pas de valeur par défaut
    }
  }, [user]);

  // Ne pas afficher le modal si pas d'utilisateur
  if (!user) {
    return null;
  }

  const handleSubmit = async () => {
    if (selectedRole !== user.role) {
      setIsUpdating(true);
      try {
        await updateUserRole(user.id, selectedRole);
        onClose();
      } catch (error) {
        // L'erreur est déjà gérée dans updateUserRole avec les toasts
        console.error('Erreur lors de la mise à jour du rôle:', error);
      } finally {
        setIsUpdating(false);
      }
    } else {
      onClose();
    }
  };

  const hasRoleChanged = selectedRole !== user.role;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold text-gray-900'>
            Modifier le rôle de l&apos;utilisateur
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
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
              <span className='text-sm font-medium text-gray-500 block'>Rôle actuel</span>
              <span className='text-base text-gray-900 capitalize'>{user.role}</span>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium text-gray-500 block'>Nouveau rôle</label>
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white'
                disabled={isUpdating}
              >
                <option value=''>Sélectionner un nouveau rôle</option>
                {AVAILABLE_ROLES.filter(role => role.label !== user.role).map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className='flex space-x-3 pt-4'>
            <Button onClick={onClose} variant='outline' className='flex-1' disabled={isUpdating}>
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              className='flex-1 bg-blue-500 hover:bg-blue-600 text-white'
              disabled={isUpdating || !hasRoleChanged}
            >
              {isUpdating ? 'Mise à jour...' : 'Mettre à jour'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
