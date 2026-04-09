import { createHmac } from 'crypto';

import { createClerkClient } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';

const SECRET = process.env.CLERK_SECRET_KEY ?? 'fallback-secret';

function hashCode(code: string, email: string): string {
  return createHmac('sha256', SECRET).update(`${email}:${code}`).digest('hex');
}

function verifyToken(token: string): { email: string; codeHash: string; expiry: number } | null {
  try {
    const [data, sig] = token.split('.');
    const expectedSig = createHmac('sha256', SECRET).update(data).digest('base64url');
    if (sig !== expectedSig) return null;
    return JSON.parse(Buffer.from(data, 'base64url').toString());
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invitationId, orgId, firstName, lastName, emailAddress, otpCode, otpToken } = body;

    // Validation des paramètres
    if (!invitationId || !orgId || !firstName || !lastName || !emailAddress) {
      return NextResponse.json(
        { success: false, message: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    if (!otpCode || !otpToken) {
      return NextResponse.json(
        { success: false, message: 'Le code de vérification est requis' },
        { status: 400 }
      );
    }

    // Verify OTP token
    const payload = verifyToken(otpToken);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Token de vérification invalide' },
        { status: 400 }
      );
    }

    // Check expiry
    if (Date.now() > payload.expiry) {
      return NextResponse.json(
        {
          success: false,
          message: 'Le code de vérification a expiré. Veuillez en demander un nouveau.',
        },
        { status: 400 }
      );
    }

    // Check email matches
    if (payload.email !== emailAddress) {
      return NextResponse.json({ success: false, message: 'Email invalide' }, { status: 400 });
    }

    // Verify OTP code
    const expectedHash = hashCode(otpCode, emailAddress);
    if (expectedHash !== payload.codeHash) {
      return NextResponse.json(
        { success: false, message: 'Code de vérification incorrect' },
        { status: 400 }
      );
    }

    // OTP verified — proceed with account creation
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    try {
      // Verify invitation exists
      const invitation = await clerkClient.organizations.getOrganizationInvitation({
        organizationId: orgId,
        invitationId,
      });

      if (!invitation) {
        return NextResponse.json(
          { success: false, message: 'Invitation non trouvée' },
          { status: 404 }
        );
      }

      // Create user without password (OTP-based auth)
      const user = await clerkClient.users.createUser({
        emailAddress: [emailAddress],
        firstName,
        lastName,
        skipPasswordRequirement: true,
        publicMetadata: { firstName, lastName },
      });

      if (!user) {
        return NextResponse.json(
          { success: false, message: 'Erreur lors de la création du compte' },
          { status: 500 }
        );
      }

      // Add user to organization
      await clerkClient.organizations.createOrganizationMembership({
        organizationId: orgId,
        userId: user.id,
        role: invitation.role as 'org:admin' | 'org:member',
      });

      // Revoke invitation
      await clerkClient.organizations.revokeOrganizationInvitation({
        organizationId: orgId,
        invitationId,
      });

      return NextResponse.json({
        success: true,
        message: 'Compte créé et invitation acceptée avec succès',
        userId: user.id,
      });
    } catch (error: unknown) {
      console.error('Erreur Clerk:', JSON.stringify(error, null, 2));

      let errorMessage = "Une erreur inconnue s'est produite";

      if (
        error &&
        typeof error === 'object' &&
        'errors' in error &&
        Array.isArray((error as { errors: unknown[] }).errors)
      ) {
        const clerkErrors = (
          error as { errors: Array<{ code: string; longMessage?: string; message?: string }> }
        ).errors;
        const duplicateError = clerkErrors.find(e => e.code === 'form_identifier_exists');

        if (duplicateError) {
          errorMessage =
            'Un compte existe déjà avec cette adresse email. Connectez-vous directement.';
        } else {
          errorMessage = clerkErrors.map(e => e.longMessage || e.message || e.code).join(', ');
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: (error as { status?: number })?.status || 500 }
      );
    }
  } catch (error: unknown) {
    console.error('Erreur API:', error);
    return NextResponse.json(
      {
        success: false,
        message: `Erreur serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      },
      { status: 500 }
    );
  }
}
