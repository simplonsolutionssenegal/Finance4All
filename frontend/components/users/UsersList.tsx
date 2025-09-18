'use client';

import { useOrganization, useUser, useOrganizationList } from '@clerk/nextjs';
import { Search, Plus, Trash2, Edit } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import ConfirmDesactivationModal from '@/components/users/ConfirmDesactivationModal';
import { useRemoveUserFromOrganization } from '@/lib/clerk-utils';
import type OrganizationUser from '@/types/OrganizationUser';

import RoleEditModal from './RoleEditModal';
import UserInfoModal from './UserInfoModal';

export default function UsersList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasTriedToSetActive, setHasTriedToSetActive] = useState(false);
  const [selectedUser, setSelectedUser] = useState<OrganizationUser | null>(null);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [showConfirmDeactivation, setShowConfirmDeactivation] = useState(false);
  const [showRoleEdit, setShowRoleEdit] = useState(false);

  const { user } = useUser();
  const { setActive } = useOrganizationList();
  const { removeUser } = useRemoveUserFromOrganization();
  const { organization, memberships, invitations } = useOrganization({
    memberships: {
      infinite: true,
    },
    invitations: true,
  });

  useEffect(() => {
    // Si pas d'organisation active, essayer d'activer la première organisation de l'utilisateur
    if (
      !organization &&
      user?.organizationMemberships &&
      user.organizationMemberships.length > 0 &&
      !hasTriedToSetActive
    ) {
      setHasTriedToSetActive(true);
      const firstOrg = user.organizationMemberships[0];
      setActive?.({ organization: firstOrg.organization.id }).catch(console.error);
      return;
    }

    // Si l'utilisateur n'a aucune organisation, arrêter le chargement
    if (user && user.organizationMemberships.length === 0) {
      setLoading(false);
      setUsers([]);
      return;
    }

    // Si pas d'organisation ET qu'on a déjà essayé d'activer une organisation, arrêter le loading
    if (!organization && hasTriedToSetActive) {
      setLoading(false);
      setUsers(currentUsers => (currentUsers.length > 0 ? [] : currentUsers));
      return;
    }

    // Si pas d'organisation et on n'a pas encore essayé d'en activer une, rester en loading
    if (!organization) {
      setLoading(true);
      return;
    }

    // Si on a une organisation mais pas encore de memberships, rester en loading
    if (!memberships) {
      setLoading(true);
      return;
    }

    // Si les memberships sont en cours de chargement, rester en loading
    if (memberships.isLoading) {
      setLoading(true);
      return;
    }

    // Si on arrive ici, le chargement est terminé
    setLoading(false);

    if (memberships?.data && memberships.data.length > 0) {
      const organizationUsers: OrganizationUser[] = memberships.data.map(membership => {
        const userData = membership.publicUserData;

        return {
          id: userData?.userId || membership.id,
          fullName: userData
            ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Utilisateur'
            : 'Utilisateur',
          role: membership.roleName,
          emailAddress: userData?.identifier || 'N/A',
          createAt: membership.createdAt,
          status: 'Actif',
        };
      });

      invitations?.data?.map(iv => {
        const userData = iv.publicMetadata;

        organizationUsers.push({
          id: iv.id,
          fullName: userData
            ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Utilisateur'
            : 'Utilisateur',
          role: iv.roleName,
          emailAddress: iv.emailAddress,
          createAt: iv.createdAt,
          status: 'En attente',
        });
      });

      setUsers(currentUsers => {
        if (JSON.stringify(organizationUsers) !== JSON.stringify(currentUsers)) {
          return organizationUsers;
        }
        return currentUsers;
      });
    } else {
      setUsers(currentUsers => (currentUsers.length > 0 ? [] : currentUsers));
    }
  }, [organization, memberships, user, hasTriedToSetActive, setActive, invitations?.data]);

  const filteredUsers = users.filter(
    user =>
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.emailAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatLastActive = (date: Date | null) => {
    if (!date) return 'Jamais connecté';

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const handleRemoveUser = (user: OrganizationUser) => {
    setSelectedUser(user);
    setShowUserInfo(true);
  };

  const handleDesactivateClick = () => {
    setShowUserInfo(false);
    setShowConfirmDeactivation(true);
  };

  const handleConfirmDesactivation = async () => {
    if (!selectedUser) return;

    try {
      await removeUser(selectedUser.id);
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleCloseModals = () => {
    setShowUserInfo(false);
    setShowConfirmDeactivation(false);
    setShowRoleEdit(false);
    setSelectedUser(null);
  };

  const handleEditRole = (user: OrganizationUser) => {
    setSelectedUser(user);
    setShowRoleEdit(true);
  };

  const renderModals = () => {
    if (!selectedUser) return null;

    return (
      <>
        <UserInfoModal
          isOpen={showUserInfo}
          onClose={handleCloseModals}
          onDeactivate={handleDesactivateClick}
          user={selectedUser}
        />
        <ConfirmDesactivationModal
          isOpen={showConfirmDeactivation}
          onClose={handleCloseModals}
          onConfirm={handleConfirmDesactivation}
          user={selectedUser}
        />
        <RoleEditModal isOpen={showRoleEdit} onClose={handleCloseModals} user={selectedUser} />
      </>
    );
  };

  return (
    <Card className='bg-white shadow-sm border border-gray-100 rounded-2xl'>
      <CardHeader className='pb-4'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-xl font-semibold text-gray-900'>
            Liste des utilisateurs
          </CardTitle>
          <Button
            className='bg-teal-500 hover:bg-teal-600 text-white rounded-lg px-4 py-2'
            onClick={() => {
              // Fonctionnalité d'invitation à implémenter
              alert("Fonctionnalité d'invitation en cours de développement");
            }}
          >
            <Plus className='w-4 h-4 mr-2' />
            Ajouter un utilisateur
          </Button>
        </div>

        <div className='mt-4'>
          <div className='relative max-w-md'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
            <Input
              type='text'
              placeholder='Rechercher'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-10 pr-4 py-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent'
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className='pb-6'>
        {loading ? (
          <div className='flex flex-col items-center justify-center py-8 space-y-2'>
            <div className='text-gray-500'>Chargement des utilisateurs...</div>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow className='border-gray-200'>
                  <TableHead className='text-gray-600 font-medium'>Nom et prénom</TableHead>
                  <TableHead className='text-gray-600 font-medium'>Roles</TableHead>
                  <TableHead className='text-gray-600 font-medium'>Email</TableHead>
                  <TableHead className='text-gray-600 font-medium'>Date d&apos;ajout</TableHead>
                  <TableHead className='text-gray-600 font-medium'>Statut</TableHead>
                  <TableHead className='text-gray-600 font-medium'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers
                    .filter(u => u.id !== user?.id)
                    .map(user => (
                      <TableRow key={user.id} className='border-gray-100 hover:bg-gray-50'>
                        <TableCell className='font-medium text-gray-900'>{user.fullName}</TableCell>
                        <TableCell className='text-gray-600 capitalize'>{user.role}</TableCell>
                        <TableCell className='text-gray-600'>{user.emailAddress}</TableCell>
                        <TableCell className='text-gray-600'>
                          {formatLastActive(user.createAt)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant='secondary'
                            className={
                              user.status === 'Actif'
                                ? 'bg-green-100 text-green-700 hover:bg-green-100 border-0'
                                : 'bg-orange-100 text-orange-700 hover:bg-orange-100 border-0'
                            }
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center space-x-2'>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='h-8 w-8 p-0 text-blue-600 hover:bg-blue-50'
                              title='Modifier le rôle'
                              onClick={() => handleEditRole(user)}
                            >
                              <Edit className='w-4 h-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='h-8 w-8 p-0 text-red-600 hover:bg-red-50'
                              title="Retirer de l'organisation"
                              onClick={() => handleRemoveUser(user)}
                            >
                              <Trash2 className='w-4 h-4' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className='text-center py-8 text-gray-500'>
                      {!organization
                        ? "Vous n'êtes membre d'aucune organisation. Contactez votre administrateur."
                        : searchTerm
                          ? 'Aucun utilisateur trouvé pour cette recherche'
                          : 'Aucun utilisateur dans cette organisation'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {renderModals()}
    </Card>
  );
}
