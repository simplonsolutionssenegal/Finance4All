import { auth, createClerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { resolveAppRole } from '@/lib/role-access';

export async function GET() {
  try {
    const { userId, orgRole, sessionClaims } = await auth({
      treatPendingAsSignedOut: false,
    });

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Non authentifie' }, { status: 401 });
    }

    const orgMetadata = sessionClaims?.org_public_metadata as
      | Record<string, unknown>
      | null
      | undefined;
    const userMetadata = {
      unsafeMetadata: sessionClaims?.unsafe_metadata as Record<string, unknown> | undefined,
      publicMetadata: sessionClaims?.public_metadata as Record<string, unknown> | undefined,
    };
    const appRole = resolveAppRole(orgMetadata, orgRole, userMetadata);

    if (appRole !== 'Admin' && appRole !== 'AdminMember') {
      return NextResponse.json({ success: false, message: 'Acces refuse' }, { status: 403 });
    }

    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // Fetch all organizations
    const orgList = await clerkClient.organizations.getOrganizationList({ limit: 100 });
    const organizations = orgList.data;

    const partnerOrgs = organizations.filter(
      org => (org.publicMetadata as Record<string, unknown>)?.type === 'partner'
    );
    const adminOrgs = organizations.filter(
      org => (org.publicMetadata as Record<string, unknown>)?.type === 'admin'
    );

    // Collect ALL users across ALL organizations
    interface UserEntry {
      id: string;
      fullName: string;
      role: string;
      emailAddress: string;
      organizationName: string;
      organizationType: string;
      createdAt: string | null;
      status: string;
    }

    const allUsers: UserEntry[] = [];
    const seenUserIds = new Set<string>();

    // Stats counters
    let totalAdminsOrg = 0;
    let totalMembersOrg = 0;
    let totalRecipients = 0;
    let platformAdmins = 0;
    let platformMembers = 0;

    // Process admin organizations
    for (const org of adminOrgs) {
      const memberships = await clerkClient.organizations.getOrganizationMembershipList({
        organizationId: org.id,
        limit: 100,
      });

      for (const membership of memberships.data) {
        const userData = membership.publicUserData;
        const memberId = userData?.userId || membership.id;

        // Skip the current platform admin from the list (they shouldn't see themselves)
        if (memberId === userId) continue;

        if (membership.role === 'org:admin') platformAdmins++;
        else platformMembers++;

        if (!seenUserIds.has(memberId)) {
          seenUserIds.add(memberId);
          allUsers.push({
            id: memberId,
            fullName:
              `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || 'Utilisateur',
            role: membership.role,
            emailAddress: userData?.identifier || 'N/A',
            organizationName: org.name,
            organizationType: 'admin',
            createdAt: membership.createdAt ? new Date(membership.createdAt).toISOString() : null,
            status: 'Actif',
          });
        }
      }

      // Also fetch pending invitations for admin orgs
      const invitations = await clerkClient.organizations.getOrganizationInvitationList({
        organizationId: org.id,
        status: ['pending'],
        limit: 100,
      });

      for (const inv of invitations.data) {
        const meta = inv.publicMetadata as Record<string, string> | undefined;
        allUsers.push({
          id: inv.id,
          fullName: `${meta?.firstName || ''} ${meta?.lastName || ''}`.trim() || 'Utilisateur',
          role: inv.role || 'org:member',
          emailAddress: inv.emailAddress,
          organizationName: org.name,
          organizationType: 'admin',
          createdAt: inv.createdAt ? new Date(inv.createdAt).toISOString() : null,
          status: 'En attente',
        });
      }
    }

    // Process partner organizations
    for (const org of partnerOrgs) {
      const memberships = await clerkClient.organizations.getOrganizationMembershipList({
        organizationId: org.id,
        limit: 100,
      });

      for (const membership of memberships.data) {
        const userData = membership.publicUserData;
        const memberId = userData?.userId || membership.id;

        if (membership.role === 'org:admin') totalAdminsOrg++;
        else if (membership.role === 'org:member') totalMembersOrg++;
        else if (membership.role === 'org:recipient') totalRecipients++;

        if (!seenUserIds.has(memberId)) {
          seenUserIds.add(memberId);
          allUsers.push({
            id: memberId,
            fullName:
              `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || 'Utilisateur',
            role: membership.role,
            emailAddress: userData?.identifier || 'N/A',
            organizationName: org.name,
            organizationType: 'partner',
            createdAt: membership.createdAt ? new Date(membership.createdAt).toISOString() : null,
            status: 'Actif',
          });
        }
      }

      // Fetch pending invitations for partner orgs
      const invitations = await clerkClient.organizations.getOrganizationInvitationList({
        organizationId: org.id,
        status: ['pending'],
        limit: 100,
      });

      for (const inv of invitations.data) {
        const meta = inv.publicMetadata as Record<string, string> | undefined;
        if (inv.role === 'org:admin') totalAdminsOrg++;
        else if (inv.role === 'org:member') totalMembersOrg++;
        else if (inv.role === 'org:recipient') totalRecipients++;

        allUsers.push({
          id: inv.id,
          fullName: `${meta?.firstName || ''} ${meta?.lastName || ''}`.trim() || 'Utilisateur',
          role: inv.role || 'org:member',
          emailAddress: inv.emailAddress,
          organizationName: org.name,
          organizationType: 'partner',
          createdAt: inv.createdAt ? new Date(inv.createdAt).toISOString() : null,
          status: 'En attente',
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalUsers: allUsers.length,
          totalOrganizations: partnerOrgs.length,
          adminsOrg: totalAdminsOrg,
          membersOrg: totalMembersOrg,
          recipients: totalRecipients,
          platformAdmins,
          platformMembers,
        },
        users: allUsers,
      },
    });
  } catch (error: unknown) {
    console.error('Erreur lors de la recuperation des stats:', error);
    const errorMessage =
      error instanceof Error ? error.message : "Une erreur inconnue s'est produite";
    return NextResponse.json(
      { success: false, message: `Erreur serveur: ${errorMessage}` },
      { status: 500 }
    );
  }
}
