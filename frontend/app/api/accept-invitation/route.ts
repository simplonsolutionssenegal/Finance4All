import { createClerkClient } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invitationId, orgId, password, firstName, lastName, emailAddress } = body;

    // Validation des paramètres
    if (!invitationId || !orgId || !password || !firstName || !lastName || !emailAddress) {
      return NextResponse.json(
        {
          message: 'Tous les champs sont requis',
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
      // Vérifier que l'invitation existe
      const invitation = await clerkClient.organizations.getOrganizationInvitation({
        organizationId: orgId,
        invitationId,
      });

      if (!invitation) {
        return NextResponse.json(
          {
            success: false,
            message: 'Invitation non trouvée',
          },
          { status: 404 }
        );
      }

      // Créer l'utilisateur avec firstName et lastName en publicMetadata
      const user = await clerkClient.users.createUser({
        emailAddress: [emailAddress],
        password,
        publicMetadata: {
          firstName,
          lastName,
        },
        firstName,
        lastName,
      });

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            message: 'Erreur lors de la création du compte utilisateur',
          },
          { status: 500 }
        );
      }

      // Accepter l'invitation pour joindre l'organisation
      await clerkClient.organizations.createOrganizationMembership({
        organizationId: orgId,
        userId: user.id,
        role: invitation.role as 'org:admin' | 'org:member',
      });

      // Supprimer l'invitation après acceptation
      await clerkClient.organizations.revokeOrganizationInvitation({
        organizationId: orgId,
        invitationId,
      });

      return NextResponse.json({
        success: true,
        message: 'Compte créé et invitation acceptée avec succès',
        userId: user.id,
      });
    } catch (error: any) {
      console.error(
        "Erreur détaillée lors de l'acceptation de l'invitation:",
        JSON.stringify(error, null, 2)
      );

      let errorMessage = "Une erreur inconnue s'est produite";

      if (error && typeof error === 'object' && 'errors' in error && Array.isArray(error.errors)) {
        const pwnedError = error.errors.find((e: any) => e.code === 'form_password_pwned');

        if (pwnedError) {
          errorMessage =
            'Ce mot de passe a été trouvé dans une fuite de données publique. Pour la sécurité de votre compte, veuillez en choisir un autre.';
        } else {
          errorMessage = error.errors
            .map((e: any) => {
              if (e.code === 'form_password_length_too_short')
                return 'Le mot de passe est trop court.';
              if (e.code === 'form_password_requirements_not_met')
                return 'Le mot de passe ne respecte pas les critères de sécurité.';
              return e.longMessage || e.message;
            })
            .join(', ');
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      if (errorMessage === 'Unprocessable Entity') {
        errorMessage = 'Données invalides. Veuillez vérifier votre mot de passe.';
      }

      if (errorMessage.includes('password') || errorMessage.includes('mot de passe')) {
        console.error('Password validation failed:', errorMessage);
      }

      return NextResponse.json(
        {
          success: false,
          message: `${errorMessage}`,
        },
        { status: (error as any).status || 500 }
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
