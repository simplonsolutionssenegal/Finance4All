import { useOrganizationList, useUser } from '@clerk/nextjs';

interface UserRedirectOptions {
  adminDashboardPath?: string;
  organizationDashboardPath?: string;
  beneficiaryDashboardPath?: string;
}

/**
 * Version synchrone pour déterminer la route de redirection selon le rôle de l'utilisateur
 */
export function getUserRedirectPath(
  userRoles: string[] | null,
  organizationMemberships?: Array<{ role: string }> | null,
  options: UserRedirectOptions = {}
): string {
  const {
    adminDashboardPath = '/dashboard',
    organizationDashboardPath = '/organisation-dashboard',
    beneficiaryDashboardPath = '/beneficiaire-dashboard',
  } = options;

  // 1. Vérifier d'abord si l'utilisateur est admin global (rôle dans les métadonnées)
  const isGlobalAdmin = userRoles?.includes('admin');

  if (isGlobalAdmin) {
    // Si admin global ET pas dans une organisation → dashboard admin
    if (!organizationMemberships || organizationMemberships.length === 0) {
      return adminDashboardPath;
    }
  }

  // 2. Vérifier si l'utilisateur est membre d'une organisation
  if (organizationMemberships && organizationMemberships.length > 0) {
    const hasRecipientRole = organizationMemberships.some(
      membership => membership.role === 'org:recipient'
    );

    if (hasRecipientRole) {
      return beneficiaryDashboardPath;
    }

    // Si dans une organisation avec rôle org:admin ou org:member
    return organizationDashboardPath;
  }

  // 3. Par défaut (pas d'organisation)
  return beneficiaryDashboardPath;
}

/**
 * Hook React pour déterminer la route de redirection
 */
export function useGetUserRedirect(options: UserRedirectOptions = {}): {
  redirectUrl: string;
  isLoaded: boolean;
  userRoles: string[];
  hasOrganization: boolean;
} {
  const { user } = useUser();
  const { userMemberships, isLoaded: orgListLoaded } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });

  // Extraire les rôles globaux de l'utilisateur depuis les métadonnées
  const userRoles = (user?.publicMetadata?.roles as string[]) || [];

  const isLoaded = orgListLoaded && !!user;

  if (!isLoaded) {
    return {
      redirectUrl: options.beneficiaryDashboardPath || '/beneficiaire-dashboard',
      isLoaded: false,
      userRoles: [],
      hasOrganization: false,
    };
  }

  const redirectUrl = getUserRedirectPath(
    userRoles,
    userMemberships?.data?.map(m => ({ role: m.role })),
    options
  );

  return {
    redirectUrl,
    isLoaded: true,
    userRoles,
    hasOrganization: (userMemberships?.data?.length || 0) > 0,
  };
}
