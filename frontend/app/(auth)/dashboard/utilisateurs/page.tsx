'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';

import { NEXT_PUBLIC_API_UR } from '@/app/_constantes/api_constants';
import type { FilterOptions } from '@/components/admin/FilterPopup';
import SearchBar from '@/components/admin/SearchBar';
import UserStatst from '@/components/admin/UserStatst';
import UserTable from '@/components/admin/UserTable';
import type { ApiResponse, BackendUserDto, User } from '@/models/user';


const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    role: [],
    status: [],
    lastConnection: '',
    customDate: '',
  });

  const filterUsersBySearchTerm = (list: User[], term: string) => {
    if (!term.trim()) return list;
    const q = term.toLowerCase();
    return list.filter((u) =>
      u.email.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.firstName ?? '').toLowerCase().includes(q) ||
      (u.lastName ?? '').toLowerCase().includes(q) ||
      (u.role ?? '').toLowerCase().includes(q),
    );
  };

  const filteredUsers = useMemo(() => {
    let result = [...users];

    // recherche textuelle
    result = filterUsersBySearchTerm(result, searchTerm);

    // filtre rôle
    if (filters.role.length > 0) {
      const rolesLower = filters.role.map((r) => r.toLowerCase());
      result = result.filter((u) => rolesLower.includes((u.role ?? '').toLowerCase()));
    }

    // filtre statut
    if (filters.status.length > 0) {
      result = result.filter((u) => filters.status.includes(u.status));
    }

    return result;
  }, [users, searchTerm, filters]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const url = `${NEXT_PUBLIC_API_UR}users/organisations/37/users`; // ⚠️ vérifie l’orthographe de ta constante (URL vs UR)

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);

      const api = (await res.json()) as ApiResponse<BackendUserDto>;
      if (api.status !== 'success' || !Array.isArray(api.data)) {
        throw new Error('Format de réponse API inattendu');
      }

      const mapped: User[] = api.data.map((u) => ({
        id: String(u.id),
        email: u.email,
        username: u.username,
        firstName: u.firstName,
        lastName: u.lastName,
        organisationId: u.organisationId,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        lastSignInAt: u.lastSignInAt,
        isActive: u.isActive,
        status: u.status,
        // on ne met PAS null pour coller au type `role?: string`
        role: u.role ?? u.publicMetadata?.role ?? undefined,
      }));

      setUsers(mapped);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Erreur de chargement</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => loadUsers()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2">
      <UserStatst users={users} />
      <SearchBar
        onSearch={setSearchTerm}
        resultsCount={filteredUsers.length}
        onApplyFilters={handleApplyFilters}
      />
      <UserTable users={filteredUsers} isLoading={isLoading} />
    </div>
  );
};

export default UsersPage;
