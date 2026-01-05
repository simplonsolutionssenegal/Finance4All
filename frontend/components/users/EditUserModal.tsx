import { useOrganization } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type OrganizationUser from '@/types/OrganizationUser';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateUser: (userData: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    organizationId: string;
  }) => void;
  user: OrganizationUser | null;
  isUpdating?: boolean;
}

const AVAILABLE_ROLES = [
  { value: 'org:recipient', label: 'Bénéficiaire' },
  { value: 'org:admin', label: 'Administrateur' },
  { value: 'org:member', label: 'Organisation' },
];

export default function EditUserModal({
  isOpen,
  onClose,
  onUpdateUser,
  user,
  isUpdating = false,
}: Readonly<EditUserModalProps>) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [organizationId, setOrganizationId] = useState('');

  const { organization } = useOrganization();

  useEffect(() => {
    if (!isOpen) {
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setRole('');
      setOrganizationId('');
      return;
    }

    if (user && organization) {
      // Extraire prénom et nom depuis fullName
      const nameParts = user.fullName.split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setEmail(user.emailAddress || '');
      setPhone(user.phoneNumber || '');
      if (user.role) {
        setRole(user.role);
      }
      setOrganizationId(organization.id);
    }
  }, [user, isOpen, organization]);

  const handleSubmit = async () => {
    if (user && organizationId) {
      onUpdateUser({
        userId: user.id,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        role,
        organizationId,
      });
    }
  };

  const handleClose = () => {
    onClose();
  };

  const isFormValid = role && organizationId;

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-lg border-0 rounded-2xl'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold text-gray-900'>
            Modifier l&apos;utilisateur
          </DialogTitle>
          <DialogDescription className='text-sm text-gray-600'>
            Mettez à jour les informations de l&apos;utilisateur
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <label htmlFor='firstName' className='text-sm font-medium text-gray-700 block'>
                  Prénom
                </label>
                <Input
                  id='firstName'
                  placeholder='Prénom'
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className='w-full bg-gray-50 border-0'
                  disabled={isUpdating}
                />
              </div>
              <div className='space-y-2'>
                <label htmlFor='lastName' className='text-sm font-medium text-gray-700 block'>
                  Nom
                </label>
                <Input
                  id='lastName'
                  placeholder='Nom'
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className='w-full bg-gray-50 border-0'
                  disabled={isUpdating}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <label htmlFor='email' className='text-sm font-medium text-gray-700 block'>
                Email
              </label>
              <Input
                id='email'
                type='email'
                placeholder='email@example.com'
                value={email}
                onChange={e => setEmail(e.target.value)}
                className='w-full bg-gray-50 border-0'
                disabled={isUpdating}
              />
            </div>

            <div className='space-y-2'>
              <label htmlFor='phone' className='text-sm font-medium text-gray-700 block'>
                Téléphone
              </label>
              <Input
                id='phone'
                type='tel'
                placeholder='+221 77 123 4567'
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className='w-full bg-gray-50 border-0'
                disabled={isUpdating}
              />
            </div>

            <div className='space-y-2'>
              <label htmlFor='role' className='text-sm font-medium text-gray-700 block'>
                Rôle
              </label>
              <Select value={role} onValueChange={setRole} disabled={isUpdating} key={user?.id}>
                <SelectTrigger id='role' className='w-full bg-gray-50 border-0 cursor-pointer'>
                  <SelectValue placeholder='Sélectionner un rôle' />
                </SelectTrigger>
                <SelectContent className='bg-white border-0 rounded-lg shadow-xl'>
                  {AVAILABLE_ROLES.map(roleOption => (
                    <SelectItem
                      key={roleOption.value}
                      value={roleOption.value}
                      className='cursor-pointer hover:bg-gray-100'
                    >
                      {roleOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='flex justify-end space-x-3 pt-4'>
            <Button
              onClick={handleClose}
              variant='outline'
              className='border-gray-300 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'
              disabled={isUpdating}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              className='bg-primary-300 cursor-pointer hover:bg-primary-400 text-white'
              disabled={isUpdating || !isFormValid}
            >
              {isUpdating ? (
                <span className='flex items-center gap-2'>
                  <span className='inline-flex size-4 animate-spin rounded-full border-2 border-white border-b-transparent' />
                  <span>Mise à jour...</span>
                </span>
              ) : (
                'Mettre à jour'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
