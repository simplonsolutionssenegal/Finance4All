import { useAuth } from '@clerk/nextjs';

import { getDefaultRedirect } from '@/lib/role-access';

/**
 * Tous les roles redirigent vers /dashboard (unifie).
 */
export function getUserRedirectPath(): string {
  return getDefaultRedirect();
}

/**
 * Hook pour obtenir l'URL de redirection post-login.
 *
 * Utilise uniquement useAuth() (pas useOrganizationList) pour ne pas bloquer
 * la redirection des utilisateurs sans organisation (ex: Beneficiaire).
 */
export function useGetUserRedirect(): {
  redirectUrl: string;
  isLoaded: boolean;
  userRoles: string[];
  hasOrganization: boolean;
} {
  const { isLoaded, userId, orgId } = useAuth();

  return {
    redirectUrl: getDefaultRedirect(),
    isLoaded: isLoaded && !!userId,
    userRoles: [],
    hasOrganization: !!orgId,
  };
}
