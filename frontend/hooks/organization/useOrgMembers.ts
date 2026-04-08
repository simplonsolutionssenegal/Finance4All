import { useOrganization } from '@clerk/nextjs';
import { useMemo } from 'react';

export interface OrgMember {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: string;
  status: 'Actif' | 'En attente';
  createdAt: Date;
  imageUrl?: string;
}

export function useOrgMembers() {
  const { organization, memberships, invitations } = useOrganization({
    memberships: { infinite: true },
    invitations: { status: ['pending'] },
  });

  const isLoaded = !!organization && !!memberships && !memberships.isLoading;

  const members: OrgMember[] = useMemo(() => {
    if (!memberships?.data) return [];

    const memberList: OrgMember[] = memberships.data.map(membership => {
      const userData = membership.publicUserData;
      return {
        id: membership.id,
        userId: userData?.userId || membership.id,
        firstName: userData?.firstName || '',
        lastName: userData?.lastName || '',
        fullName:
          `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || 'Utilisateur',
        email: userData?.identifier || '',
        role: membership.role,
        status: 'Actif' as const,
        createdAt: membership.createdAt,
        imageUrl: userData?.imageUrl,
      };
    });

    if (invitations?.data) {
      invitations.data.forEach(invitation => {
        const meta = invitation.publicMetadata as Record<string, string> | undefined;
        memberList.push({
          id: invitation.id,
          userId: invitation.id,
          firstName: meta?.firstName || '',
          lastName: meta?.lastName || '',
          fullName: `${meta?.firstName || ''} ${meta?.lastName || ''}`.trim() || 'Utilisateur',
          email: invitation.emailAddress,
          role: invitation.role || 'org:member',
          status: 'En attente' as const,
          createdAt: invitation.createdAt,
        });
      });
    }

    return memberList;
  }, [memberships?.data, invitations?.data]);

  const membersByRole = useMemo(() => {
    const grouped: Record<string, number> = {};
    members.forEach(m => {
      grouped[m.role] = (grouped[m.role] || 0) + 1;
    });
    return grouped;
  }, [members]);

  const pendingCount = useMemo(
    () => members.filter(m => m.status === 'En attente').length,
    [members]
  );

  return {
    members,
    isLoaded,
    totalCount: members.length,
    membersByRole,
    pendingCount,
    organizationName: organization?.name || '',
    reloadMembers: memberships?.revalidate,
  };
}
