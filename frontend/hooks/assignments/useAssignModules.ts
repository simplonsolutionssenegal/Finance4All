'use client';

import { useAuth, useOrganization } from '@clerk/nextjs';
import { useState } from 'react';

import { apiClient } from '@/lib/api-client';

type AssignResponse = {
  success: true;
  message: string;
};

export function useAssignModules() {
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();
  const { organization } = useOrganization();

  async function assign(beneficiaryId: string, moduleIds: string[]) {
    const organizationId = organization?.id;
    if (!organizationId) throw new Error('organizationId manquant');

    setLoading(true);
    try {
      const token = await getToken();

      await apiClient<AssignResponse>(`beneficiaries/${beneficiaryId}/assignments`, 'POST', token, {
        organizationId, // ✅ indispensable
        moduleIds,
      });
    } finally {
      setLoading(false);
    }
  }

  return { assign, loading };
}
