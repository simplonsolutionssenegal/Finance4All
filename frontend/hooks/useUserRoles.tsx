import { useUser, useOrganizationList, useOrganization } from '@clerk/nextjs';
import { useMemo } from 'react';
import {
  resolveAppRole,
  getAccessGroup,
  ROLE_LABELS,
  type AppRole,
  type AccessGroup,
} from '@/lib/role-access';

export interface UserRolesData {
  userRoles: string[];
  isSystemAdmin: boolean;
  organizationRoles: string[];
  organizationMemberships: Array<{ role: string; organizationId: string }>;
  hasOrganization: boolean;
  roleLabel: string;
  isLoaded: boolean;
  hasRole: (role: string) => boolean;
  hasOrganizationRole: (role: string) => boolean;
  appRole: AppRole;
  accessGroup: AccessGroup;
}

/**
 * Hook réutilisable pour récupérer et gérer les rôles de l'utilisateur
 */
export function useUserRoles(): UserRolesData {
  const { user } = useUser();
  const { organization, membership } = useOrganization();
  const { userMemberships, isLoaded: orgListLoaded } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });

  const isLoaded = orgListLoaded && !!user;

  // Extraire les rôles globaux de l'utilisateur depuis les métadonnées
  const userRoles = useMemo(() => {
    if (!user) return [];
    return (user.publicMetadata?.roles as string[]) || [];
  }, [user]);

  // Vérifier si l'utilisateur est un administrateur système
  const isSystemAdmin = useMemo(() => {
    return userRoles.includes('admin');
  }, [userRoles]);

  // Extraire les rôles d'organisation
  const organizationMemberships = useMemo(() => {
    if (!userMemberships?.data) return [];
    return userMemberships.data.map(m => ({
      role: m.role,
      organizationId: m.organization.id,
    }));
  }, [userMemberships]);

  const organizationRoles = useMemo(() => {
    return organizationMemberships.map(m => m.role);
  }, [organizationMemberships]);

  const hasOrganization = useMemo(() => {
    return organizationMemberships.length > 0;
  }, [organizationMemberships]);

  // Résoudre le rôle applicatif depuis l'org active
  const appRole = useMemo<AppRole>(() => {
    if (!isLoaded) return 'Beneficiare';
    const orgMetadata = (organization?.publicMetadata as Record<string, unknown>) ?? null;
    const orgRole = membership?.role ?? null;
    return resolveAppRole(orgMetadata, orgRole, {
      unsafeMetadata: (user?.unsafeMetadata as Record<string, unknown>) ?? undefined,
      publicMetadata: (user?.publicMetadata as Record<string, unknown>) ?? undefined,
    });
  }, [isLoaded, organization, membership, user]);

  const accessGroup = useMemo<AccessGroup>(() => {
    return getAccessGroup(appRole);
  }, [appRole]);

  const roleLabel = useMemo(() => {
    if (!isLoaded) return 'Utilisateur';
    return ROLE_LABELS[appRole];
  }, [isLoaded, appRole]);

  // Fonction pour vérifier si l'utilisateur a un rôle spécifique
  const hasRole = useMemo(() => {
    return (role: string) => {
      return userRoles.includes(role);
    };
  }, [userRoles]);

  // Fonction pour vérifier si l'utilisateur a un rôle d'organisation spécifique
  const hasOrganizationRole = useMemo(() => {
    return (role: string) => {
      return organizationRoles.some(r => r === role || r === `org:${role}`);
    };
  }, [organizationRoles]);

  return {
    userRoles,
    isSystemAdmin,
    organizationRoles,
    organizationMemberships,
    hasOrganization,
    roleLabel,
    isLoaded,
    hasRole,
    hasOrganizationRole,
    appRole,
    accessGroup,
  };
}
