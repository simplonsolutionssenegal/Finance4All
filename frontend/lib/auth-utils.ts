/**
 * Utilitaires d'authentification serveur pour Clerk.
 */

import { auth } from '@clerk/nextjs/server';

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export async function getBackendToken(getToken: GetToken): Promise<string | null> {
  try {
    const withTemplate = await getToken({ template: 'backend' });
    if (withTemplate) return withTemplate;
  } catch {
    // Template "backend" absent ou erreur Clerk : on utilise le token par défaut
  }
  return getToken();
}

export interface AuthStatus {
  userId: string | null;
  isBeneficiary: boolean;
  orgId: string | null;
  orgRole: string | null;
}

export async function getAuthStatus(): Promise<AuthStatus> {
  const authResult = await auth({
    // Accepter les sessions "pending" pour éviter la redirection vers login
    treatPendingAsSignedOut: false,
  });

  const { userId, orgId, orgRole, sessionClaims } = authResult;

  const isRecipientFromOrg = orgRole === 'org:recipient';
  const claims = sessionClaims as Record<string, unknown> | undefined;
  const roleFromMetadata =
    (claims?.metadata as Record<string, unknown>)?.role ??
    (claims?.publicMetadata as Record<string, unknown>)?.role;
  const isBeneficiaryFromMetadata =
    roleFromMetadata === 'beneficiary' || roleFromMetadata === 'BENEFICIAIRE';

  const isBeneficiary = isRecipientFromOrg || !!isBeneficiaryFromMetadata;

  return {
    userId: userId ?? null,
    isBeneficiary,
    orgId: orgId ?? null,
    orgRole: orgRole ?? null,
  };
}
