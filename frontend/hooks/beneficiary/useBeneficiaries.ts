'use client';

import { useAuth, useOrganization } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';

import { type Beneficiary } from '../../types/beneficiaire/beneficiary';

export function useBeneficiaries() {
  const { organization } = useOrganization();
  const { getToken } = useAuth();
  const organizationId = organization?.id;

  const { data, isLoading } = useQuery({
    queryKey: ['beneficiaries', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const token = await getToken();
      const base = process.env.NEXT_PUBLIC_API_URL;
      if (!base) throw new Error('NEXT_PUBLIC_API_URL non défini');

      const res = await fetch(`${base}/beneficiaries?organizationId=${organizationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        console.error('  - Error:', txt);
        throw new Error(txt || `Erreur GET (${res.status})`);
      }

      const json = await res.json();
      return json.data as Beneficiary[];
    },
    enabled: !!organizationId,
  });

  return { data: data ?? [], isLoading };
}
