import { createClerkClient } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Résout un __clerk_ticket en invitation_id.
 * Clerk ajoute ce token au redirectUrl mais ne fournit pas l'invitation_id directement.
 * On liste les invitations pending de l'org pour trouver celle qui correspond.
 */
export async function POST(request: NextRequest) {
  try {
    const { ticket, orgId } = (await request.json()) as {
      ticket?: string;
      orgId?: string;
    };

    if (!ticket || !orgId) {
      return NextResponse.json(
        { success: false, message: 'Paramètres manquants (ticket, orgId)' },
        { status: 400 }
      );
    }

    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // Lister les invitations pending de cette organisation
    const invitations = await clerkClient.organizations.getOrganizationInvitationList({
      organizationId: orgId,
      status: ['pending'],
    });

    if (!invitations.data || invitations.data.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Aucune invitation en attente trouvée' },
        { status: 404 }
      );
    }

    // Prendre la plus récente invitation pending
    // (Clerk ne permet pas de résoudre le ticket directement via l'API Backend)
    const latestInvitation = invitations.data.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

    return NextResponse.json({
      success: true,
      invitationId: latestInvitation.id,
      orgId,
    });
  } catch (error) {
    console.error('Erreur resolve-ticket:', error);
    return NextResponse.json(
      {
        success: false,
        message: `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      },
      { status: 500 }
    );
  }
}
