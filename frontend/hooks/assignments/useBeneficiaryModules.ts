'use client';

import { useAuth, useOrganization } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

import { apiClient } from '@/lib/api-client';
import type { ModuleWithAssignment } from '@/types/modules/assignments';

type ModulesResponse = {
  success: true;
  data: ModuleWithAssignment[];
};

export function useBeneficiaryModules(beneficiaryId: string | null, open: boolean) {
  const [data, setData] = useState<ModuleWithAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { getToken } = useAuth();
  const { organization } = useOrganization();

  async function refetch() {
    const organizationId = organization?.id;
    if (!beneficiaryId) return;

    if (!organizationId) {
      setError(new Error('organizationId manquant'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();

      const result = await apiClient<ModulesResponse>(
        `beneficiaries/${beneficiaryId}/modules?organizationId=${encodeURIComponent(organizationId)}`,
        'GET',
        token
      );

      setData(result.data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open && beneficiaryId) refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, beneficiaryId, organization?.id]);

  return { data, loading, error, refetch };
}
