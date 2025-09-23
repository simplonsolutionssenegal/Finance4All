import { createClerkClient } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invitationId, orgId } = body;

    // Validation des paramètres
    if (!invitationId) {
      return NextResponse.json(
        {
          message: "ID d'invitation requis",
          error: 'MISSING_INVITATION_ID',
          success: false,
        },
        { status: 400 }
      );
    }

    if (!orgId) {
      return NextResponse.json(
        {
          message: "ID de l'organisation requis",
          error: 'MISSING_ORG_ID',
          success: false,
        },
        { status: 400 }
      );
    }

    // Initialiser le client Clerk
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    try {
      const invitation = await clerkClient.organizations.getOrganizationInvitation({
        organizationId: orgId,
        invitationId,
      });

      if (!invitation) {
        return NextResponse.json(
          {
            success: false,
            message: 'Invitation non trouvée dans aucune organisation',
          },
          { status: 404 }
        );
      }

      // Récupérer les détails de l'organisation
      const organization = await clerkClient.organizations.getOrganization({
        organizationId: orgId,
      });

      // Construire la réponse avec les données de l'invitation
      const responseData = {
        success: true,
        invitation: {
          id: invitation.id,
          emailAddress: invitation.emailAddress,
          role: invitation.role,
          status: invitation.status,
          publicMetadata: invitation.publicMetadata,
          organizationName: organization?.name || 'Organisation',
          organizationId: orgId,
          createdAt: invitation.createdAt,
          updatedAt: invitation.updatedAt,
        },
      };

      return NextResponse.json(responseData);
    } catch (error: unknown) {
      console.error('Erreur lors de la recherche:', error);
      const errorMessage =
        error instanceof Error ? error.message : "Une erreur inconnue s'est produite";

      return NextResponse.json(
        {
          success: false,
          message: `Erreur lors de la recherche: ${errorMessage}`,
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error('Erreur API:', error);
    const errorMessage =
      error instanceof Error ? error.message : "Une erreur inconnue s'est produite";

    return NextResponse.json(
      {
        success: false,
        message: `Erreur serveur: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
