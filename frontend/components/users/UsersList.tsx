'use client';

import { useOrganization, useUser, useOrganizationList } from '@clerk/nextjs';
import {
  Search,
  Plus,
  MoreVertical,
  Mail,
  Phone,
  Eye,
  Pencil,
  Archive,
  Trash2,
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import AddUserModal from '@/components/users/AddUserModal';
import ConfirmDesactivationModal from '@/components/users/ConfirmDesactivationModal';
import EditUserModal from '@/components/users/EditUserModal';
import { useRemoveUserFromOrganization, useCreateUser, useUpdateUserRole } from '@/lib/clerk-utils';
import type OrganizationUser from '@/types/OrganizationUser';

import UserInfoModal from './UserInfoModal';

interface UsersListProps {
  selectedRole?: string;
  onRoleChange?: (role: string) => void;
}

export default function UsersList({
  selectedRole: externalSelectedRole,
  onRoleChange,
}: UsersListProps = {}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [internalSelectedRole, setInternalSelectedRole] = useState<string>('all');

  // Use external role if provided, otherwise use internal state
  const selectedRole =
    externalSelectedRole !== undefined ? externalSelectedRole : internalSelectedRole;
  const setSelectedRole = onRoleChange || setInternalSelectedRole;
  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasTriedToSetActive, setHasTriedToSetActive] = useState(false);
  const [selectedUser, setSelectedUser] = useState<OrganizationUser | null>(null);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [showConfirmDeactivation, setShowConfirmDeactivation] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  const { user } = useUser();
  const { setActive } = useOrganizationList();
  const { removeUser } = useRemoveUserFromOrganization();
  const { createUser } = useCreateUser();
  const { updateUserRole } = useUpdateUserRole();
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
        // Le téléphone peut être dans les métadonnées de l'utilisateur, mais n'est pas directement accessible via PublicUserData
        // On laisse undefined pour l'instant, peut être ajouté via une API si nécessaire
        const phoneNumber = undefined;

        return {
          id: userData?.userId || membership.id,
          fullName: userData
            ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Utilisateur'
            : 'Utilisateur',
          role: membership.roleName,
          emailAddress: userData?.identifier || 'N/A',
          phoneNumber,
          organizationName: organization?.name,
          organizationType: (organization?.publicMetadata as { type?: string })?.type || undefined,
          createAt: membership.createdAt,
          lastActiveAt: undefined, // Non disponible via PublicUserData
          status: 'Actif',
        };
      });

      invitations?.data?.map(iv => {
        const userData = iv.publicMetadata;
        const phoneNumber = (userData as { phoneNumber?: string })?.phoneNumber || undefined;

        organizationUsers.push({
          id: iv.id,
          fullName: userData
            ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Utilisateur'
            : 'Utilisateur',
          role: iv.roleName,
          emailAddress: iv.emailAddress,
          phoneNumber,
          organizationName: organization?.name,
          organizationType: (organization?.publicMetadata as { type?: string })?.type || undefined,
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

  const roles = [
    { value: 'all', label: 'Tous les rôles' },
    { value: 'org:admin', label: 'Administrateur' },
    { value: 'org:member', label: 'Organisation' },
    { value: 'org:recipient', label: 'Bénéficiaire' },
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.emailAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.organizationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phoneNumber?.includes(searchTerm);

    const matchesRole =
      selectedRole === 'all' ||
      user.role.toLowerCase() === selectedRole.toLowerCase() ||
      (selectedRole === 'org:admin' && user.role.toLowerCase().includes('admin')) ||
      (selectedRole === 'org:member' && user.role.toLowerCase().includes('organisation')) ||
      (selectedRole === 'org:recipient' && user.role.toLowerCase().includes('bénéficiaire')) ||
      (selectedRole === 'archived' && user.status === 'Archivé');

    return matchesSearch && matchesRole;
  });

  const formatLastActive = (date: Date | null | undefined) => {
    if (!date) return 'Jamais connecté';

    const formatted = new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));

    // Format: "14 oct. 2025" (avec point après le mois)
    return formatted.replace(/\s+/g, ' ').toLowerCase();
  };

  const handleViewDetails = (user: OrganizationUser) => {
    setSelectedUser(user);
    setShowUserInfo(true);
  };

  const handleEditUser = (user: OrganizationUser) => {
    setSelectedUser(user);
    setShowEditUser(true);
  };

  const handleArchiveUser = (_user: OrganizationUser) => {
    // TODO: Implémenter l'archivage
  };

  const handleDeleteUser = (user: OrganizationUser) => {
    setSelectedUser(user);
    setShowConfirmDeactivation(true);
  };

  const handleConfirmDesactivation = async () => {
    if (!selectedUser) return;

    setIsDeletingUser(true);
    try {
      const result = await removeUser(selectedUser.id);
      if (result?.success) {
        handleCloseModals();
        setTimeout(() => {
          setIsDeletingUser(false);
          window.location.reload();
        }, 500);
      } else {
        setIsDeletingUser(false);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setIsDeletingUser(false);
    }
  };

  const handleCloseModals = () => {
    setShowUserInfo(false);
    setShowConfirmDeactivation(false);
    setShowEditUser(false);
    setShowAddUser(false);
    setSelectedUser(null);
  };

  const handleUpdateUser = async (userData: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    organizationId: string;
  }) => {
    setIsUpdatingUser(true);
    try {
      if (!organization) {
        throw new Error('Aucune organisation active');
      }
      await updateUserRole(userData.userId, userData.role);
      handleCloseModals();
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }, 500);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const handleCreateUser = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    organizationId: string;
  }) => {
    setIsCreatingUser(true);
    try {
      await createUser(userData);
      handleCloseModals();
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur:", error);
    } finally {
      setIsCreatingUser(false);
    }
  };

  const renderModals = () => {
    return (
      <>
        <AddUserModal
          isOpen={showAddUser}
          onClose={handleCloseModals}
          onCreateUser={handleCreateUser}
          isCreating={isCreatingUser}
        />
        {selectedUser && (
          <>
            <UserInfoModal isOpen={showUserInfo} onClose={handleCloseModals} user={selectedUser} />
            <EditUserModal
              isOpen={showEditUser}
              onClose={handleCloseModals}
              onUpdateUser={handleUpdateUser}
              user={selectedUser}
              isUpdating={isUpdatingUser}
            />
            <ConfirmDesactivationModal
              isOpen={showConfirmDeactivation}
              onClose={handleCloseModals}
              onConfirm={handleConfirmDesactivation}
              user={selectedUser}
              isDeleting={isDeletingUser}
            />
          </>
        )}
      </>
    );
  };

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

  return (
    <>
      {/* Search and Filter Section */}
      <Card className='bg-white shadow-xl border border-gray-100 rounded-2xl mb-6'>
        <CardContent className='p-6'>
          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='flex-1'>
              <label className='block text-sm font-semibold text-gray-900 mb-2'>Rechercher</label>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                <Input
                  type='text'
                  placeholder='Nom, email, organisation...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-10 pr-4 py-2 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>
            </div>

            <div className='sm:w-[200px]'>
              <label className='block text-sm font-semibold text-gray-900 mb-2'>Rôle</label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className='w-full bg-gray-50 border-0 cursor-pointer'>
                  <SelectValue placeholder='Tous les rôles' />
                </SelectTrigger>

                <SelectContent className='bg-white shadow-xl border-0 rounded-lg'>
                  {roles.map(role => (
                    <SelectItem
                      key={role.value}
                      value={role.value}
                      className='cursor-pointer hover:bg-gray-100'
                    >
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='flex items-end'>
              <Button
                className='bg-primary-300 cursor-pointer hover:bg-primary-400 text-white rounded-lg px-4 py-2 whitespace-nowrap'
                onClick={() => {
                  setShowAddUser(true);
                }}
              >
                <Plus className='w-4 h-4 mr-2' />
                Créer un utilisateur
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className='bg-white shadow-sm border border-gray-100 rounded-2xl'>
        <CardContent className='p-6'>
          {loading ? (
            <div className='flex flex-col items-center justify-center py-8 space-y-2'>
              <div className='text-gray-500'>Chargement des utilisateurs...</div>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader className='rounded-t-xl bg-gray-100 border-gray-200'>
                  <TableRow className='border-gray-200 hover:bg-gray-50'>
                    <TableHead className='text-gray-700 font-semibold'>Utilisateur</TableHead>
                    <TableHead className='text-gray-700 font-semibold'>Rôle</TableHead>
                    <TableHead className='text-gray-700 font-semibold'>Organisation</TableHead>
                    <TableHead className='text-gray-700 font-semibold'>Statut</TableHead>
                    <TableHead className='text-gray-700 font-semibold'>
                      Dernière connexion
                    </TableHead>
                    <TableHead className='text-gray-700 font-semibold'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers
                      .filter(u => u.id !== user?.id)
                      .map(userItem => (
                        <TableRow key={userItem.id} className='border-gray-100 hover:bg-gray-50'>
                          <TableCell>
                            <div className='space-y-2'>
                              <div className='font-medium text-gray-900'>{userItem.fullName}</div>
                              <div className='flex items-center gap-2 text-sm text-gray-600'>
                                <Mail className='w-4 h-4 text-gray-400' />
                                <span>{userItem.emailAddress}</span>
                              </div>
                              {userItem.phoneNumber && (
                                <div className='flex items-center gap-2 text-sm text-gray-500'>
                                  <Phone className='w-4 h-4 text-gray-400' />
                                  <span>{userItem.phoneNumber}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant='secondary'
                              className={`${getRoleBadgeColor(userItem.role)} border-1 rounded-full`}
                            >
                              {getRoleDisplayName(userItem.role)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className='space-y-1'>
                              {userItem.organizationName ? (
                                <>
                                  <div className='text-gray-900 font-medium'>
                                    {userItem.organizationName}
                                  </div>
                                  {userItem.organizationType ? (
                                    <div className='text-gray-500 text-sm'>
                                      {userItem.organizationType}
                                    </div>
                                  ) : null}
                                </>
                              ) : (
                                <span className='text-gray-400'>-</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant='secondary'
                              className={
                                userItem.status === 'Actif'
                                  ? 'bg-green-100 text-green-700 hover:bg-green-100 border-1 border-green-200 rounded-full'
                                  : 'bg-orange-100 text-orange-700 hover:bg-orange-100 border-1 border-orange-200 rounded-full'
                              }
                            >
                              {userItem.status}
                            </Badge>
                          </TableCell>
                          <TableCell className='text-gray-600'>
                            {formatLastActive(userItem.lastActiveAt || userItem.createAt)}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  className='h-8 w-8 p-0 text-gray-600 hover:bg-gray-100'
                                >
                                  <MoreVertical className='w-4 h-4' />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align='end'
                                className='w-56 bg-white shadow-xl border-0 rounded-lg'
                              >
                                <DropdownMenuItem
                                  className='cursor-pointer hover:bg-gray-100'
                                  onClick={() => handleViewDetails(userItem)}
                                >
                                  <Eye className='h-4 w-4 mr-2' />
                                  Voir les détails
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className='cursor-pointer hover:bg-gray-100'
                                  onClick={() => handleEditUser(userItem)}
                                >
                                  <Pencil className='h-4 w-4 mr-2' />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className='cursor-pointer hover:bg-gray-100'
                                  onClick={() => handleArchiveUser(userItem)}
                                >
                                  <Archive className='h-4 w-4 mr-2' />
                                  Archiver
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className='cursor-pointer hover:bg-gray-100 text-red-600'
                                  onClick={() => handleDeleteUser(userItem)}
                                >
                                  <Trash2 className='h-4 w-4 mr-2' />
                                  Supprimer définitivement
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className='text-center py-8 text-gray-500'>
                        {!organization
                          ? "Vous n'êtes membre d'aucune organisation. Contactez votre administrateur."
                          : searchTerm || selectedRole !== 'all'
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
      </Card>

      {renderModals()}
    </>
  );
}
