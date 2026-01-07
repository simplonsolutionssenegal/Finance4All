import { useUser, useOrganizationList } from '@clerk/nextjs';
import { useMemo } from 'react';

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
}

/**
 * Hook réutilisable pour récupérer et gérer les rôles de l'utilisateur
 */
export function useUserRoles(): UserRolesData {
  const { user } = useUser();
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

  // Déterminer le label du rôle pour l'affichage
  const roleLabel = useMemo(() => {
    if (!isLoaded) return 'Utilisateur';

    if (isSystemAdmin) {
      if (!hasOrganization) {
        return 'Super Admin';
      } else {
        // Admin with organization membership
        const orgRole = organizationMemberships[0]?.role?.replace('org:', '');
        return orgRole === 'admin' ? 'Super Admin' : 'Admin';
      }
    } else if (hasOrganization) {
      // Check organization role
      const orgRole = organizationMemberships[0]?.role?.replace('org:', '');
      return orgRole === 'admin' ? 'Super Admin' : 'Admin';
    } else {
      // Check metadata for beneficiary or other roles
      const unsafeRole = user?.unsafeMetadata?.role as string | undefined;
      const publicRole = user?.publicMetadata?.role as string | undefined;
      if (unsafeRole === 'admin' || publicRole === 'admin') {
        return 'Super Admin';
      }
      // Par défaut, on retourne 'Utilisateur' si aucun rôle n'est trouvé
      return 'Utilisateur';
    }
  }, [isLoaded, isSystemAdmin, hasOrganization, organizationMemberships, user]);

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
  };
}
