import { useState } from 'react';
import { toast } from 'sonner';

interface CreateOrganizationData {
  name: string;
  country: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
}

interface CreateOrganizationResult {
  success: boolean;
  message?: string;
  data?: {
    organizationId: string;
    organizationName: string;
    adminUserId: string;
  };
}

export function useCreateOrganization(options?: { onSuccess?: () => void }) {
  const [isCreating, setIsCreating] = useState(false);

  const createOrganization = async (
    data: CreateOrganizationData
  ): Promise<CreateOrganizationResult> => {
    setIsCreating(true);

    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result: CreateOrganizationResult = await response.json();

      if (!response.ok || !result.success) {
        toast.error('Échec de la création', {
          description: result.message || "Impossible de créer l'organisation. Veuillez réessayer.",
        });
        return result;
      }

      toast.success('Organisation créée avec succès', {
        description: `L'organisation "${data.name}" a été créée avec ${data.adminFirstName} ${data.adminLastName} comme administrateur.`,
      });

      options?.onSuccess?.();
      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur réseau. Veuillez réessayer.';
      toast.error('Erreur', { description: message });
      return { success: false, message };
    } finally {
      setIsCreating(false);
    }
  };

  return { createOrganization, isCreating };
}
