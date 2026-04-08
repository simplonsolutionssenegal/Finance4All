import { useAuth, useOrganization } from '@clerk/nextjs';
import { useState } from 'react';
import { toast } from 'sonner';

interface AddMemberData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export function useAddMember(options?: { onSuccess?: () => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const { getToken } = useAuth();
  const { organization } = useOrganization();

  const addMember = async (data: AddMemberData) => {
    if (!organization) {
      toast.error('Aucune organisation active');
      return { success: false };
    }

    setIsAdding(true);

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1'}/users`;
      const token = await getToken();

      const body = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        organizationId: organization.id,
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error("Échec de l'ajout", {
          description: result.message || "Impossible d'ajouter le membre. Veuillez réessayer.",
        });
        return { success: false, message: result.message };
      }

      toast.success('Membre ajouté avec succès', {
        description: `${data.firstName} ${data.lastName} a été ajouté à l'organisation.`,
      });

      options?.onSuccess?.();
      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur réseau. Veuillez réessayer.';
      toast.error('Erreur', { description: message });
      return { success: false, message };
    } finally {
      setIsAdding(false);
    }
  };

  return { addMember, isAdding };
}
