import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateUser: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  }) => void;
  isCreating?: boolean;
}

const AVAILABLE_ROLES = [
  { value: 'org:member', label: 'Member' },
  { value: 'org:admin', label: 'Admin' },
];

export default function AddUserModal({
  isOpen,
  onClose,
  onCreateUser,
  isCreating = false,
}: Readonly<AddUserModalProps>) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setFirstName('');
      setLastName('');
      setEmail('');
      setRole('');
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    onCreateUser({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      role,
    });
  };

  const handleClose = () => {
    onClose();
  };

  const isFormValid = firstName.trim() && lastName.trim() && email.trim() && role;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold text-gray-900'>
            Ajouter un nouvel utilisateur
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-3'>
            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-2'>
                <label htmlFor='firstName' className='text-sm font-medium text-gray-500 block'>Prénom</label>
                <Input
                  id='firstName'
                  placeholder='John'
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className='w-full'
                  disabled={isCreating}
                />
              </div>
              <div className='space-y-2'>
                <label htmlFor='lastName' className='text-sm font-medium text-gray-500 block'>Nom</label>
                <Input
                  id='lastName'
                  placeholder='DOE'
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className='w-full'
                  disabled={isCreating}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <label htmlFor='email' className='text-sm font-medium text-gray-500 block'>Email</label>
              <Input
                id='email'
                type='email'
                placeholder='john.doe@email.com'
                value={email}
                onChange={e => setEmail(e.target.value)}
                className='w-full'
                disabled={isCreating}
              />
            </div>

            <div className='space-y-2'>
              <label htmlFor='role' className='text-sm font-medium text-gray-500 block'>Rôle</label>
              <select
                id='role'
                value={role}
                onChange={e => setRole(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white'
                disabled={isCreating}
              >
                <option value=''>Sélectionner</option>
                {AVAILABLE_ROLES.map(roleOption => (
                  <option key={roleOption.value} value={roleOption.value}>
                    {roleOption.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className='flex space-x-3 pt-4'>
            <Button
              onClick={handleClose}
              variant='outline'
              className='flex-1'
              disabled={isCreating}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              className='flex-1 bg-teal-500 hover:bg-teal-600 text-white'
              disabled={isCreating || !isFormValid}
            >
              {isCreating ? 'Création...' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}