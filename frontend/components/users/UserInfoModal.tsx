'use client';

import { Calendar, Mail, Phone, TrendingUp } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type OrganizationUser from '@/types/OrganizationUser';

interface UserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: OrganizationUser;
}

const getRoleDisplayName = (role: string) => {
  if (role.toLowerCase().includes('admin')) return 'Super Administrateur';
  if (role.toLowerCase().includes('organisation') || role.toLowerCase().includes('member'))
    return 'Organisation';
  if (role.toLowerCase().includes('bénéficiaire') || role.toLowerCase().includes('recipient'))
    return 'Bénéficiaire';
  return role;
};

const getRoleBadgeColor = (role: string) => {
  if (role.toLowerCase().includes('admin'))
    return 'bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200';
  if (role.toLowerCase().includes('organisation') || role.toLowerCase().includes('member'))
    return 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200';
  if (role.toLowerCase().includes('bénéficiaire') || role.toLowerCase().includes('recipient'))
    return 'bg-gray-100 text-gray-600 hover:bg-gray-100 border-gray-200';
  return 'bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200';
};

const formatDate = (date: Date | null | undefined) => {
  if (!date) return 'Non disponible';
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
};

export default function UserInfoModal({ isOpen, onClose, user }: Readonly<UserInfoModalProps>) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-2xl border-0 rounded-2xl p-6'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold text-gray-900 mb-6'>
            Détails de l&apos;utilisateur
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Nom et badges */}
          <div>
            <h3 className='text-xl font-semibold text-gray-900 mb-4'>{user.fullName}</h3>
            <div className='flex flex-wrap gap-2'>
              <Badge
                variant='secondary'
                className={`${getRoleBadgeColor(user.role)} border-1 rounded-full`}
              >
                {getRoleDisplayName(user.role)}
              </Badge>
              <Badge
                variant='secondary'
                className={
                  user.status === 'Actif'
                    ? 'bg-green-100 text-green-700 hover:bg-green-100 border-1 border-green-200 rounded-full'
                    : 'bg-orange-100 text-orange-700 hover:bg-orange-100 border-1 border-orange-200 rounded-full'
                }
              >
                {user.status}
              </Badge>
            </div>
          </div>

          {/* Informations détaillées */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Colonne gauche */}
            <div className='space-y-4'>
              <div>
                <div className='flex items-center gap-2 text-sm font-medium text-gray-500 mb-1'>
                  <Mail className='h-4 w-4' />
                  <span>Email</span>
                </div>
                <p className='text-base text-gray-900'>{user.emailAddress}</p>
              </div>

              <div>
                <div className='flex items-center gap-2 text-sm font-medium text-gray-500 mb-1'>
                  <Calendar className='h-4 w-4' />
                  <span>Créé le</span>
                </div>
                <p className='text-base text-gray-900'>{formatDate(user.createAt)}</p>
              </div>
            </div>

            {/* Colonne droite */}
            <div className='space-y-4'>
              <div>
                <div className='flex items-center gap-2 text-sm font-medium text-gray-500 mb-1'>
                  <Phone className='h-4 w-4' />
                  <span>Téléphone</span>
                </div>
                <p className='text-base text-gray-900'>{user.phoneNumber || 'Non disponible'}</p>
              </div>

              <div>
                <div className='flex items-center gap-2 text-sm font-medium text-gray-500 mb-1'>
                  <TrendingUp className='h-4 w-4' />
                  <span>Dernière connexion</span>
                </div>
                <p className='text-base text-gray-900'>
                  {formatDate(user.lastActiveAt || user.createAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
