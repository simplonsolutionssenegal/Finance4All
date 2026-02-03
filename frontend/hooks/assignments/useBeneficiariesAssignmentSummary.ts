'use client';

import { useAuth, useOrganization } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

import { apiClient } from '@/lib/api-client';
import type { BeneficiaryAssignmentSummary } from '@/types/modules/assignments';

type SummaryResponse = {
  success: true;
  data: BeneficiaryAssignmentSummary[];
};

export function useBeneficiariesAssignmentSummary() {
  const [data, setData] = useState<BeneficiaryAssignmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { getToken } = useAuth();
  const { organization } = useOrganization();

  async function refetch() {
    const organizationId = organization?.id;
    if (!organizationId) {
      setError(new Error('organizationId manquant'));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();

      const result = await apiClient<SummaryResponse>(
        `beneficiaries/assignments/summary?organizationId=${encodeURIComponent(organizationId)}`,
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
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization?.id]);

  return { data, loading, error, refetch };
}
