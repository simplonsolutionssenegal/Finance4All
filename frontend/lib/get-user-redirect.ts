import { useUser } from '@clerk/nextjs';

import { useUserRoles } from '@/hooks/useUserRoles';

interface UserRedirectOptions {
  adminDashboardPath?: string;
  organizationDashboardPath?: string;
  beneficiaryDashboardPath?: string;
}

/**
 * Utilise la même logique que useUserRoles
 */
export function getUserRedirectPath(
  userRoles: string[] | null,
  organizationMemberships?: Array<{ role: string }> | null,
  options: UserRedirectOptions = {},
  userMetadata?: {
    unsafeMetadata?: Record<string, unknown>;
    publicMetadata?: Record<string, unknown>;
    externalAccounts?: Array<unknown>;
  } | null
): string {
  const {
    adminDashboardPath = '/dashboard',
    organizationDashboardPath = '/organisation-dashboard',
    beneficiaryDashboardPath = '/beneficiaire-dashboard',
  } = options;

  // Utiliser la même logique que useUserRoles pour déterminer le rôle système
  const isSystemAdmin = userRoles?.includes('admin') ?? false;
  const hasOrganization = (organizationMemberships?.length ?? 0) > 0;

  if (isSystemAdmin && !hasOrganization) {
    return adminDashboardPath;
  }

  if (hasOrganization && organizationMemberships) {
    const hasRecipientRole = organizationMemberships.some(
      membership => membership.role === 'org:recipient'
    );

    if (hasRecipientRole) {
      return beneficiaryDashboardPath;
    }

    return organizationDashboardPath;
  }

  const unsafeRole = userMetadata?.unsafeMetadata?.role as string | undefined;
  const publicRole = userMetadata?.publicMetadata?.role as string | undefined;
  const isBeneficiary =
    unsafeRole === 'beneficiary' ||
    unsafeRole === 'BENEFICIAIRE' ||
    publicRole === 'beneficiary' ||
    publicRole === 'BENEFICIAIRE';

  if (isBeneficiary) {
    return beneficiaryDashboardPath;
  }

  return beneficiaryDashboardPath;
}

/**
 * Utilise useUserRoles pour une gestion cohérente des rôles
 */
export function useGetUserRedirect(options: UserRedirectOptions = {}): {
  redirectUrl: string;
  isLoaded: boolean;
  userRoles: string[];
  hasOrganization: boolean;
} {
  // Utiliser useUserRoles pour obtenir toutes les informations sur les rôles
  const { userRoles, organizationMemberships, hasOrganization, isLoaded } = useUserRoles();

  // Récupérer les métadonnées de l'utilisateur pour la détection des bénéficiaires
  const { user } = useUser();

  if (!isLoaded) {
    return {
      redirectUrl: options.beneficiaryDashboardPath || '/beneficiaire-dashboard',
      isLoaded: false,
      userRoles: [],
      hasOrganization: false,
    };
  }

  // Préparer les métadonnées de l'utilisateur pour la détection des bénéficiaires
  const userMetadata = user
    ? {
        unsafeMetadata: user.unsafeMetadata as Record<string, unknown> | undefined,
        publicMetadata: user.publicMetadata as Record<string, unknown> | undefined,
        externalAccounts: user.externalAccounts || [],
      }
    : null;

  // Convertir organizationMemberships au format attendu par getUserRedirectPath
  const membershipsForRedirect = organizationMemberships.map(m => ({
    role: m.role,
  }));

  const redirectUrl = getUserRedirectPath(
    userRoles,
    membershipsForRedirect.length > 0 ? membershipsForRedirect : null,
    options,
    userMetadata
  );

  return {
    redirectUrl,
    isLoaded: true,
    userRoles,
    hasOrganization,
  };
}
