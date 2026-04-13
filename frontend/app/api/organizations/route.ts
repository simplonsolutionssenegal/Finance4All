import { auth, createClerkClient } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';

import { resolveAppRole } from '@/lib/role-access';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { name, country, address, adminFirstName, adminLastName, adminEmail } = body;

    if (!name || !country || !adminFirstName || !adminLastName || !adminEmail) {
      return NextResponse.json(
        { success: false, message: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // Create the organization (createdBy adds the creator as admin automatically)
    const organization = await clerkClient.organizations.createOrganization({
      name,
      createdBy: userId,
      publicMetadata: { type: 'partner', country, ...(address && { address }) },
    });

    // Remove the platform admin from the new partner org
    // (createdBy auto-adds them, but they should not be a member)
    await clerkClient.organizations.deleteOrganizationMembership({
      organizationId: organization.id,
      userId,
    });

    // Check if the AdminOrg user already exists
    let adminUser;
    const existingUsers = await clerkClient.users.getUserList({
      emailAddress: [adminEmail],
    });

    if (existingUsers.data.length > 0) {
      adminUser = existingUsers.data[0];
    } else {
      adminUser = await clerkClient.users.createUser({
        emailAddress: [adminEmail],
        firstName: adminFirstName,
        lastName: adminLastName,
        publicMetadata: {
          firstName: adminFirstName,
          lastName: adminLastName,
        },
      });
    }

    // Add the AdminOrg user as org:admin of the new organization
    await clerkClient.organizations.createOrganizationMembership({
      organizationId: organization.id,
      userId: adminUser.id,
      role: 'org:admin',
    });

    return NextResponse.json({
      success: true,
      message: 'Organisation creee avec succes',
      organizationId: organization.id,
      organizationName: organization.name,
      adminUserId: adminUser.id,
    });
  } catch (error: any) {
    console.error("Erreur lors de la creation de l'organisation:", JSON.stringify(error, null, 2));

    // Handle Clerk-specific errors
    if (error && typeof error === 'object' && 'errors' in error && Array.isArray(error.errors)) {
      const isDuplicate = error.errors.some(
        (e: any) => e.code === 'duplicate_record' || e.code === 'form_identifier_exists'
      );

      if (isDuplicate) {
        const errorMessage = error.errors.map((e: any) => e.longMessage || e.message).join(', ');

        return NextResponse.json({ success: false, message: errorMessage }, { status: 409 });
      }

      const errorMessage = error.errors.map((e: any) => e.longMessage || e.message).join(', ');

      return NextResponse.json({ success: false, message: errorMessage }, { status: 422 });
    }

    const errorMessage =
      error instanceof Error ? error.message : "Une erreur inconnue s'est produite";

    return NextResponse.json(
      { success: false, message: `Erreur serveur: ${errorMessage}` },
      { status: 500 }
    );
  }
}
