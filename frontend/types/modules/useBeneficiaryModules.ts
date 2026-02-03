'use client';

import { useEffect, useState } from 'react';

import { apiGet } from '@/lib/api/assignments';
import type { BeneficiaryAssignmentSummary } from '@/types/modules/assignments';

export function useBeneficiariesAssignmentSummary() {
  const [data, setData] = useState<BeneficiaryAssignmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  async function refetch() {
    setLoading(true);
    setError(null);
    try {
      const result = await apiGet<BeneficiaryAssignmentSummary[]>(
        '/beneficiaries/assignments/summary'
      );
      setData(result);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refetch();
  }, []);

  return { data, loading, error, refetch };
}
