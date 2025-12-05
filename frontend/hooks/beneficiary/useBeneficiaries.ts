'use client';

import { useOrganization, useOrganizationList, useUser } from '@clerk/nextjs';
import { useEffect, useMemo, useState } from 'react';

// eslint-disable-next-line no-duplicate-imports
import {
  BeneficiaryStatus,
  type Beneficiary,
  type BeneficiaryRole,
} from '../../types/beneficiaire/beneficiary';

function normalizeRole(role: BeneficiaryRole['role'] | string): string {
  const r = String(role ?? '')
    .trim()
    .toLowerCase();
  return r.includes(':') ? (r.split(':').pop() ?? r) : r;
}

function getRole(obj: BeneficiaryRole): string {
  return obj?.role ?? '';
}
const BENEFICIARY_ROLE_NORMALIZED = 'recipient';

function toIso(d: unknown) {
  try {
    return new Date(d as any).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

export function useBeneficiaries() {
  const [data, setData] = useState<Beneficiary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasTriedToSetActive, setHasTriedToSetActive] = useState(false);

  const { user } = useUser();
  const { setActive } = useOrganizationList();

  const { organization, memberships, invitations } = useOrganization({
    memberships: { infinite: true },
    invitations: true,
  });

  useEffect(() => {
    if (!organization && user?.organizationMemberships?.length && !hasTriedToSetActive) {
      setHasTriedToSetActive(true);
      const firstOrg = user.organizationMemberships[0];
      setActive?.({ organization: firstOrg.organization.id }).catch(console.error);
    }
  }, [organization, user, hasTriedToSetActive, setActive]);

  const rows = useMemo(() => {
    const result: Beneficiary[] = [];

    const mData = memberships?.data ?? [];
    const iData = invitations?.data ?? [];

    for (const m of mData as any[]) {
      const normRole = normalizeRole(getRole(m));
      if (normRole !== BENEFICIARY_ROLE_NORMALIZED) continue;

      const u = m.publicUserData;
      result.push({
        id: u?.userId || m.id,
        firstName: u?.firstName ?? '',
        lastName: u?.lastName ?? '',
        email: u?.identifier ?? '',
        phone: undefined,
        status: BeneficiaryStatus.ACTIVE,
        progressPercent: 0,
        createdAt: toIso(m.createdAt),
      });
    }
    for (const iv of iData as any[]) {
      const normRole = normalizeRole(getRole(iv));
      if (normRole !== BENEFICIARY_ROLE_NORMALIZED) continue;

      const meta = iv.publicMetadata ?? {};
      result.push({
        id: iv.id,
        firstName: meta.firstName ?? '',
        lastName: meta.lastName ?? '',
        email: iv.emailAddress ?? '',
        phone: meta.phone ?? undefined,
        status: BeneficiaryStatus.INACTIVE as any,
        progressPercent: 0,
        createdAt: toIso(iv.createdAt),
      });
    }

    return result;
  }, [memberships?.data, invitations?.data, organization?.id]);

  useEffect(() => {
    // aucun org
    if (!organization) {
      if (user && user.organizationMemberships.length === 0) {
        setIsLoading(false);
        setData([]);
        return;
      }
      setIsLoading(true);
      return;
    }

    if (!memberships || memberships.isLoading) {
      setIsLoading(true);
      return;
    }

    setIsLoading(false);
    setData(rows);
  }, [organization, memberships, user, rows]);

  return { data, isLoading };
}
