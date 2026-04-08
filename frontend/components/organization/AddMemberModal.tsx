'use client';

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
import { useAddMember } from '@/hooks/organization/useAddMember';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const MEMBER_ROLES = [
  { value: 'org:member', label: 'Membre Organisation' },
  { value: 'org:recipient', label: 'Bénéficiaire' },
];

export default function AddMemberModal({
  isOpen,
  onClose,
  onSuccess,
}: Readonly<AddMemberModalProps>) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { addMember, isAdding } = useAddMember({
    onSuccess: () => {
      handleClose();
      onSuccess?.();
    },
  });

  useEffect(() => {
    if (!isOpen) {
      setFirstName('');
      setLastName('');
      setEmail('');
      setRole('');
      setErrors({});
    }
  }, [isOpen]);

  const handleClose = () => {
    if (!isAdding) {
      onClose();
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (firstName.trim().length < 2) {
      newErrors.firstName = 'Le prénom doit contenir au moins 2 caractères';
    }
    if (lastName.trim().length < 2) {
      newErrors.lastName = 'Le nom doit contenir au moins 2 caractères';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Veuillez saisir une adresse email valide';
    }
    if (!role) {
      newErrors.role = 'Veuillez sélectionner un rôle';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    await addMember({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      role,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-lg border-0 rounded-2xl'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold text-gray-900'>
            Ajouter un membre
          </DialogTitle>
          <DialogDescription className='text-sm text-gray-600'>
            Le membre recevra une invitation par email
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <label htmlFor='memberFirstName' className='text-sm font-medium text-gray-700 block'>
                Prénom <span className='text-red-500'>*</span>
              </label>
              <Input
                id='memberFirstName'
                placeholder='Prénom'
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className='w-full bg-gray-50 border-0'
                disabled={isAdding}
              />
              {errors.firstName && <p className='text-sm text-red-500'>{errors.firstName}</p>}
            </div>
            <div className='space-y-2'>
              <label htmlFor='memberLastName' className='text-sm font-medium text-gray-700 block'>
                Nom <span className='text-red-500'>*</span>
              </label>
              <Input
                id='memberLastName'
                placeholder='Nom'
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className='w-full bg-gray-50 border-0'
                disabled={isAdding}
              />
              {errors.lastName && <p className='text-sm text-red-500'>{errors.lastName}</p>}
            </div>
          </div>

          <div className='space-y-2'>
            <label htmlFor='memberEmail' className='text-sm font-medium text-gray-700 block'>
              Email <span className='text-red-500'>*</span>
            </label>
            <Input
              id='memberEmail'
              type='email'
              placeholder='email@example.com'
              value={email}
              onChange={e => setEmail(e.target.value)}
              className='w-full bg-gray-50 border-0'
              disabled={isAdding}
            />
            {errors.email && <p className='text-sm text-red-500'>{errors.email}</p>}
          </div>

          <div className='space-y-2'>
            <label htmlFor='memberRole' className='text-sm font-medium text-gray-700 block'>
              Rôle <span className='text-red-500'>*</span>
            </label>
            <Select value={role} onValueChange={setRole} disabled={isAdding}>
              <SelectTrigger id='memberRole' className='w-full bg-gray-50 border-0 cursor-pointer'>
                <SelectValue placeholder='Sélectionner un rôle' />
              </SelectTrigger>
              <SelectContent className='bg-white border-0 rounded-lg shadow-xl'>
                {MEMBER_ROLES.map(r => (
                  <SelectItem
                    key={r.value}
                    value={r.value}
                    className='cursor-pointer hover:bg-gray-100'
                  >
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && <p className='text-sm text-red-500'>{errors.role}</p>}
          </div>

          <div className='flex justify-end space-x-3 pt-4'>
            <Button
              onClick={handleClose}
              variant='outline'
              className='border-gray-300 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'
              disabled={isAdding}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              className='bg-primary-300 cursor-pointer hover:bg-primary-400 text-white'
              disabled={isAdding}
            >
              {isAdding ? (
                <span className='flex items-center gap-2'>
                  <span className='inline-flex size-4 animate-spin rounded-full border-2 border-white border-b-transparent' />
                  <span>Ajout...</span>
                </span>
              ) : (
                'Ajouter le membre'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
