'use client';

import { useOrganization } from '@clerk/nextjs';
import { Plus, MoreVertical, Mail, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog';
import AddMemberModal from '@/components/organization/AddMemberModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useOrgMembers, type OrgMember } from '@/hooks/organization/useOrgMembers';
import { useUserRoles } from '@/hooks/useUserRoles';

const ROLE_LABELS: Record<string, string> = {
  'org:admin': 'Admin Organisation',
  'org:member': 'Membre Organisation',
  'org:recipient': 'Bénéficiaire',
};

const ROLE_BADGE_COLORS: Record<string, string> = {
  'org:admin': 'bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200',
  'org:member': 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200',
  'org:recipient': 'bg-gray-100 text-gray-600 hover:bg-gray-100 border-gray-200',
};

export default function MembersList() {
  const { members, isLoaded, reloadMembers } = useOrgMembers();
  const { appRole } = useUserRoles();
  const { organization } = useOrganization();
  const isAdminOrg = appRole === 'AdminOrg';

  const [showAddMember, setShowAddMember] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<OrgMember | null>(null);
  const [isDeletingMember, setIsDeletingMember] = useState(false);

  const handleRoleChange = async (member: OrgMember, newRole: string) => {
    if (!organization) return;
    try {
      await organization.updateMember({
        userId: member.userId,
        role: newRole as 'org:admin' | 'org:member',
      });
      reloadMembers?.();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
    }
  };

  const handleDeleteMember = async () => {
    if (!organization || !memberToDelete) return;
    setIsDeletingMember(true);
    try {
      await organization.removeMember(memberToDelete.userId);
      setMemberToDelete(null);
      reloadMembers?.();
    } catch (error) {
      console.error('Erreur lors de la suppression du membre:', error);
    } finally {
      setIsDeletingMember(false);
    }
  };

  const handleAddSuccess = () => {
    setTimeout(() => {
      reloadMembers?.();
    }, 1000);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  };

  if (!isLoaded) {
    return (
      <Card className='bg-white shadow-sm border border-gray-100 rounded-2xl'>
        <CardContent className='p-6'>
          <div className='flex flex-col items-center justify-center py-8 space-y-2'>
            <div className='text-gray-500'>Chargement des membres...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {isAdminOrg && (
        <div className='flex justify-end mb-4'>
          <Button
            className='bg-primary-300 cursor-pointer hover:bg-primary-400 text-white rounded-lg px-4 py-2'
            onClick={() => setShowAddMember(true)}
          >
            <Plus className='w-4 h-4 mr-2' />
            Ajouter un membre
          </Button>
        </div>
      )}

      <Card className='bg-white shadow-sm border border-gray-100 rounded-2xl'>
        <CardContent className='p-6'>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader className='rounded-t-xl bg-gray-100 border-gray-200'>
                <TableRow className='border-gray-200 hover:bg-gray-50'>
                  <TableHead className='text-gray-700 font-semibold'>Nom</TableHead>
                  <TableHead className='text-gray-700 font-semibold'>Email</TableHead>
                  <TableHead className='text-gray-700 font-semibold'>Rôle</TableHead>
                  <TableHead className='text-gray-700 font-semibold'>Statut</TableHead>
                  <TableHead className='text-gray-700 font-semibold'>Date d&apos;ajout</TableHead>
                  {isAdminOrg && (
                    <TableHead className='text-gray-700 font-semibold'>Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.length > 0 ? (
                  members.map(member => (
                    <TableRow key={member.id} className='border-gray-100 hover:bg-gray-50'>
                      <TableCell>
                        <div className='font-medium text-gray-900'>{member.fullName}</div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2 text-sm text-gray-600'>
                          <Mail className='w-4 h-4 text-gray-400' />
                          <span>{member.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {isAdminOrg && member.role !== 'org:admin' ? (
                          <Select
                            value={member.role}
                            onValueChange={newRole => handleRoleChange(member, newRole)}
                          >
                            <SelectTrigger className='w-[180px] bg-gray-50 border-0 cursor-pointer h-8'>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className='bg-white border-0 rounded-lg shadow-xl'>
                              <SelectItem
                                value='org:member'
                                className='cursor-pointer hover:bg-gray-100'
                              >
                                Membre Organisation
                              </SelectItem>
                              <SelectItem
                                value='org:recipient'
                                className='cursor-pointer hover:bg-gray-100'
                              >
                                Bénéficiaire
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge
                            variant='secondary'
                            className={`${ROLE_BADGE_COLORS[member.role] || 'bg-gray-100 text-gray-700'} border-1 rounded-full`}
                          >
                            {ROLE_LABELS[member.role] || member.role}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant='secondary'
                          className={
                            member.status === 'Actif'
                              ? 'bg-green-100 text-green-700 hover:bg-green-100 border-1 border-green-200 rounded-full'
                              : 'bg-orange-100 text-orange-700 hover:bg-orange-100 border-1 border-orange-200 rounded-full'
                          }
                        >
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-gray-600'>
                        {formatDate(member.createdAt)}
                      </TableCell>
                      {isAdminOrg && (
                        <TableCell>
                          {member.role !== 'org:admin' && (
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
                                className='w-48 bg-white shadow-xl border-0 rounded-lg'
                              >
                                <DropdownMenuItem
                                  className='cursor-pointer hover:bg-gray-100 text-red-600'
                                  onClick={() => setMemberToDelete(member)}
                                >
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={isAdminOrg ? 6 : 5}
                      className='text-center py-8 text-gray-500'
                    >
                      Aucun membre dans cette organisation
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AddMemberModal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        onSuccess={handleAddSuccess}
      />

      <ConfirmDialog
        isOpen={!!memberToDelete}
        onClose={() => setMemberToDelete(null)}
        onConfirm={handleDeleteMember}
        title='Supprimer le membre'
        description={`Êtes-vous sûr de vouloir supprimer ${memberToDelete?.fullName} de l'organisation ?`}
        confirmButtonText={isDeletingMember ? 'Suppression...' : 'Supprimer'}
        icon={AlertTriangle}
        confirmButtonClassName='bg-red-600 hover:bg-red-700'
      />
    </>
  );
}
