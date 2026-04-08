import { useCallback, useEffect, useState } from 'react';

import type OrganizationUser from '@/types/OrganizationUser';

interface PlatformStats {
  totalUsers: number;
  totalOrganizations: number;
  adminsOrg: number;
  membersOrg: number;
  recipients: number;
  platformAdmins: number;
  platformMembers: number;
}

interface ApiUser {
  id: string;
  fullName: string;
  role: string;
  emailAddress: string;
  organizationName: string;
  organizationType: string;
  createdAt: string | null;
  status: string;
}

const defaultStats: PlatformStats = {
  totalUsers: 0,
  totalOrganizations: 0,
  adminsOrg: 0,
  membersOrg: 0,
  recipients: 0,
  platformAdmins: 0,
  platformMembers: 0,
};

export function usePlatformStats() {
  const [stats, setStats] = useState<PlatformStats>(defaultStats);
  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/organizations/stats');
      const result = await response.json();

      if (result.success && result.data) {
        setStats(result.data.stats);

        // Map API users to OrganizationUser type
        const mappedUsers: OrganizationUser[] = result.data.users.map((u: ApiUser) => ({
          id: u.id,
          fullName: u.fullName,
          role: u.role,
          emailAddress: u.emailAddress,
          organizationName: u.organizationName,
          organizationType: u.organizationType,
          createAt: u.createdAt ? new Date(u.createdAt) : null,
          status: u.status,
        }));

        setUsers(mappedUsers);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { stats, users, isLoading, refetch: fetchData };
}
