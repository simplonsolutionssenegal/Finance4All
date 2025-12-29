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

  const isSystemAdmin = userRoles?.includes('admin');
  if (isSystemAdmin) {
    if (!organizationMemberships || organizationMemberships.length === 0) {
      return adminDashboardPath;
    }
  }

  if (organizationMemberships && organizationMemberships.length > 0) {
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

  // Préparer les métadonnées de l'utilisateur pour la détection des bénéficiaires
  const userMetadata = user
    ? {
        unsafeMetadata: user.unsafeMetadata as Record<string, unknown> | undefined,
        publicMetadata: user.publicMetadata as Record<string, unknown> | undefined,
        externalAccounts: user.externalAccounts || [],
      }
    : null;

  const redirectUrl = getUserRedirectPath(
    userRoles,
    userMemberships?.data?.map(m => ({ role: m.role })),
    options,
    userMetadata
  );

  return {
    redirectUrl,
    isLoaded: true,
    userRoles,
    hasOrganization: (userMemberships?.data?.length || 0) > 0,
  };
}
