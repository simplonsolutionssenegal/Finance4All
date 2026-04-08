import { useOrganizationList } from '@clerk/nextjs';
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

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateUser: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    organizationId: string;
  }) => void;
  isCreating?: boolean;
}

const AVAILABLE_ROLES = [
  {
    value: 'org:member:admin',
    label: 'AdminMember',
    description: "Membre de l'equipe admin",
    orgType: 'admin' as const,
  },
  {
    value: 'org:admin',
    label: 'AdminOrg',
    description: "Admin d'une organisation partenaire",
    orgType: 'partner' as const,
  },
  {
    value: 'org:member',
    label: 'MemberOrg',
    description: "Membre d'une organisation partenaire",
    orgType: 'partner' as const,
  },
  {
    value: 'org:recipient',
    label: 'Recipient',
    description: "Beneficiaire d'une organisation",
    orgType: 'partner' as const,
  },
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
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [organizationId, setOrganizationId] = useState('');

  const { userMemberships } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });

  const allOrganizations =
    userMemberships?.data?.map(membership => ({
      id: membership.organization.id,
      name: membership.organization.name,
      type: (membership.organization.publicMetadata as Record<string, unknown>)?.type as
        | string
        | undefined,
    })) || [];

  const selectedRoleOption = AVAILABLE_ROLES.find(r => r.value === role);
  const organizations = allOrganizations.filter(org => {
    if (!selectedRoleOption) return true;
    if (selectedRoleOption.orgType === 'admin') return org.type === 'admin';
    return org.type !== 'admin';
  });

  useEffect(() => {
    if (!isOpen) {
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setRole('');
      setOrganizationId('');
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    // org:member:admin is our internal key for AdminMember — send org:member to Clerk
    const clerkRole = role === 'org:member:admin' ? 'org:member' : role;
    onCreateUser({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      role: clerkRole,
      organizationId,
    });
  };

  const handleClose = () => {
    onClose();
  };

  const isFormValid = firstName.trim() && lastName.trim() && email.trim() && role && organizationId;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-lg border-0 rounded-2xl'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold text-gray-900'>
            Créer un nouvel utilisateur
          </DialogTitle>
          <DialogDescription className='text-sm text-gray-600'>
            Les identifiants seront envoyés automatiquement par email
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <label htmlFor='firstName' className='text-sm font-medium text-gray-700 block'>
                  Prénom <span className='text-red-500'>*</span>
                </label>
                <Input
                  id='firstName'
                  placeholder='Prénom'
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className='w-full bg-gray-50 border-0'
                  disabled={isCreating}
                />
              </div>
              <div className='space-y-2'>
                <label htmlFor='lastName' className='text-sm font-medium text-gray-700 block'>
                  Nom <span className='text-red-500'>*</span>
                </label>
                <Input
                  id='lastName'
                  placeholder='Nom'
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className='w-full bg-gray-50 border-0'
                  disabled={isCreating}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <label htmlFor='email' className='text-sm font-medium text-gray-700 block'>
                Email <span className='text-red-500'>*</span>
              </label>
              <Input
                id='email'
                type='email'
                placeholder='email@example.com'
                value={email}
                onChange={e => setEmail(e.target.value)}
                className='w-full bg-gray-50 border-0'
                disabled={isCreating}
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
                disabled={isCreating}
              />
            </div>

            <div className='space-y-2'>
              <label htmlFor='role' className='text-sm font-medium text-gray-700 block'>
                Rôle <span className='text-red-500'>*</span>
              </label>
              <Select value={role} onValueChange={setRole} disabled={isCreating}>
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

            <div className='space-y-2'>
              <label htmlFor='organization' className='text-sm font-medium text-gray-700 block'>
                Organisation <span className='text-red-500'>*</span>
              </label>
              <Select
                value={organizationId}
                onValueChange={setOrganizationId}
                disabled={isCreating}
              >
                <SelectTrigger
                  id='organization'
                  className='w-full bg-gray-50 border-0 cursor-pointer'
                >
                  <SelectValue placeholder='Sélectionner une organisation' />
                </SelectTrigger>
                <SelectContent className='bg-white border-0 rounded-lg shadow-xl'>
                  {organizations.length > 0 ? (
                    organizations.map(org => (
                      <SelectItem
                        key={org.id}
                        value={org.id}
                        className='cursor-pointer hover:bg-gray-100'
                      >
                        {org.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value='none' disabled className='text-gray-400'>
                      Aucune organisation disponible
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='flex justify-end space-x-3 pt-4'>
            <Button
              onClick={handleClose}
              variant='outline'
              className='border-gray-300 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'
              disabled={isCreating}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              className='bg-primary-300 cursor-pointer hover:bg-primary-400 text-white'
              disabled={isCreating || !isFormValid}
            >
              {isCreating ? (
                <span className='flex items-center gap-2'>
                  <span className='inline-flex size-4 animate-spin rounded-full border-2 border-white border-b-transparent' />
                  <span>Création...</span>
                </span>
              ) : (
                "Créer l'utilisateur"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
