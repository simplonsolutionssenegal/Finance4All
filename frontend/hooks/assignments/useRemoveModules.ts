'use client';

import { useState } from 'react';

import { apiDelete } from '@/lib/api/assignments';

type RemoveResult = { removedCount: number };

export function useRemoveModules() {
  const [loading, setLoading] = useState(false);

  async function remove(beneficiaryId: string, moduleIds: string[]) {
    if (!moduleIds.length) return;

    setLoading(true);
    try {
      await apiDelete<RemoveResult>(
        `/beneficiaries/${beneficiaryId}/assignments`,
        { moduleIds } // si ton backend exige organizationId, ajoute-le ici
      );
    } finally {
      setLoading(false);
    }
  }

  return { remove, loading };
}
