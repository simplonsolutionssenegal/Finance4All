import { useOrganization, useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';

import { useLoader } from '@/contexts/LoaderContext';

// Define interfaces for API responses to avoid 'any'
interface BackendResponse {
  success: boolean;
  message?: string;
}

interface BackendErrorResponse {
  message?: string;
}

export const useRemoveUserFromOrganization = () => {
  const { organization } = useOrganization();
  const { showLoader, hideLoader } = useLoader();

  // Extracted fallback logic to handle user removal via Clerk directly
  const fallbackRemoveMember = async (userId: string, primaryError?: unknown) => {
    if (primaryError) {
      console.error(
        'Erreur lors de la tentative principale de suppression, passage au fallback:',
        primaryError
      );
    }

    try {
      // organization is guaranteed by the check in removeUser
      if (!organization) {
        throw new Error('Organization is null');
      }
      await organization.removeMember(userId);
      hideLoader();
      toast.success("Utilisateur retiré de l'organisation", {
        description: "L'utilisateur a été retiré de l'organisation (suppression partielle).",
      });
      return { success: true };
    } catch (fallbackError: unknown) {
      console.error('Erreur lors du fallback de suppression:', fallbackError);
      hideLoader();
      toast.error('Échec de la suppression', {
        description: "Impossible de supprimer l'utilisateur. Veuillez réessayer.",
      });
      throw new Error("Impossible de supprimer l'utilisateur après plusieurs tentatives.");
    }
  };

  const removeUser = async (userId: string) => {
    if (!organization) {
      toast.error('Aucune organisation active');
      throw new Error('Aucune organisation active');
    }

    showLoader();

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/users/${userId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            organizationId: organization.id,
          }),
        }
      );

      if (!response.ok) {
        const errorData: BackendErrorResponse = await response.json();
        // Instead of throwing, log and trigger fallback
        return await fallbackRemoveMember(userId, errorData);
      }

      const result: BackendResponse = await response.json();

      if (!result.success) {
        // Instead of throwing, log and trigger fallback
        return await fallbackRemoveMember(userId, result);
      }

      hideLoader();
      toast.success('Utilisateur supprimé avec succès', {
        description: "L'utilisateur a été retiré de l'organisation et son compte a été supprimé.",
      });
      return { success: true };
    } catch (error: unknown) {
      // This will catch network errors or other unexpected issues
      return await fallbackRemoveMember(userId, error);
    }
  };

  return { removeUser };
};

export const useUpdateUserRole = ({ reloadFn = window.location.reload }: { reloadFn?: () => void } = {}) => {
  const { organization } = useOrganization();
  const { getToken } = useAuth();
  const { showLoader, hideLoader } = useLoader();

  // Fallback vers l'API Clerk directement
  const fallbackUpdateRole = async (userId: string, newRole: string, primaryError?: unknown) => {
    if (primaryError) {
      console.error(
        'Erreur lors de la tentative principale de mise à jour, passage au fallback:',
        primaryError
      );
    }

    try {
      if (!organization) {
        throw new Error('Organization is null');
      }

      await organization.updateMember({
        userId,
        role: newRole as 'org:admin' | 'org:member',
      });

      hideLoader();
      toast.success('Rôle mis à jour avec succès', {
        description: `Le rôle de l'utilisateur a été modifié vers ${newRole === 'org:admin' ? 'Admin' : 'Member'}.`,
      });

      // Recharger la page après un court délai
      setTimeout(() => {
        reloadFn();
      }, 1500);

      return { success: true };
    } catch (fallbackError: unknown) {
      console.error('Erreur lors du fallback de mise à jour:', fallbackError);
      hideLoader();
      toast.error('Échec de la mise à jour', {
        description: "Impossible de mettre à jour le rôle de l'utilisateur. Veuillez réessayer.",
      });
      throw new Error('Impossible de mettre à jour le rôle après plusieurs tentatives.');
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    if (!organization) {
      toast.error('Aucune organisation active');
      throw new Error('Aucune organisation active');
    }

    showLoader();

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/users/${userId}`;

      // Obtenir le token d'authentification Clerk
      const token = await getToken();

      const body = {
        organizationId: organization.id,
        role: newRole,
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData: BackendErrorResponse = await response.json();
        return await fallbackUpdateRole(userId, newRole, errorData);
      }

      const result: BackendResponse = await response.json();

      if (!result.success) {
        // Utiliser le fallback au lieu de lancer une erreur
        return await fallbackUpdateRole(userId, newRole, result);
      }

      hideLoader();
      toast.success('Rôle mis à jour avec succès', {
        description: `Le rôle de l'utilisateur a été modifié vers ${newRole === 'org:admin' ? 'Admin' : 'Member'}.`,
      });

      // Recharger la page après un court délai pour permettre à l'utilisateur de voir le toast
      setTimeout(() => {
        reloadFn();
      }, 1500);

      return { success: true };
    } catch (error: unknown) {
      // Utiliser le fallback pour les erreurs réseau ou autres
      return await fallbackUpdateRole(userId, newRole, error);
    }
  };

  return { updateUserRole };
};
