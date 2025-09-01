'use client';

import { useEffect, useMemo, useState } from 'react';
import SearchBar from '@/components/admin/SearchBar';
import UserTable from '@/components/admin/UserTable';
import UserStats from '@/components/admin/UserStatst';
import { NEXT_PUBLIC_API_UR } from '@/app/_constantes/api_constants';
import type { FilterOptions } from '@/components/admin/FilterPopup';

interface User {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;     // ex: 'admin'
  status: string;   // ex: 'ACTIF'
  avatar: string;
  isActive: boolean;
  lastLoginAt: string; // ISO
  organisationId: number;
  organisation: { id: number; name: string; avatar: string; address: string; phone: string; createdAt: string; updatedAt: string; };
  createdAt: string;
  updatedAt: string;
}

type ApiResponse = { status: string; results: number; data: User[]; };

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    role: [],
    status: [],
    lastConnection: '',
    customDate: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔎 Chargement
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch(`${NEXT_PUBLIC_API_UR}users/organizations/37/users`);
        if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
        const api: ApiResponse = await res.json();
        if (api.status !== 'success' || !Array.isArray(api.data)) {
          throw new Error('Format de réponse API inattendu');
        }
        setUsers(api.data);
        setFilteredUsers(api.data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur inconnue');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // 📋 Options dynamiques pour le popup (évite de hardcoder)
  const rolesOptions = useMemo(
    () => Array.from(new Set(users.map(u => (u.role ?? '').toLowerCase()))).filter(Boolean).sort(),
    [users]
  );
  const statusesOptions = useMemo(
    () => Array.from(new Set(users.map(u => (u.status ?? '').toUpperCase()))).filter(Boolean).sort(),
    [users]
  );

  // 🧮 Filtrage combiné (recherche + filtres)
useEffect(() => {
  const term = searchTerm.trim().toLowerCase();

  const next = users.filter((u) => {
    const matchSearch =
      term === '' ||
      (u.firstName ?? '').toLowerCase().includes(term) ||
      (u.lastName ?? '').toLowerCase().includes(term) ||
      (u.email ?? '').toLowerCase().includes(term);

    // roles en lowercase
    const matchRole =
      filters.role.length === 0 ||
      filters.role.includes((u.role ?? '').toLowerCase());

    // status en UPPERCASE
    const matchStatus =
      filters.status.length === 0 ||
      filters.status.includes((u.status ?? '').toUpperCase());

    // dates
    let matchDate = true;
    if (filters.lastConnection) {
      if (!u.lastLoginAt) matchDate = false;
      else {
        const d = new Date(u.lastLoginAt);
        if (Number.isNaN(d.getTime())) matchDate = false;
        else {
          const now = new Date();
          if (filters.lastConnection === 'recent') {
            const from = new Date(); from.setDate(now.getDate() - 7);
            matchDate = d >= from && d <= now;
          } else if (filters.lastConnection === 'month') {
            const from = new Date(); from.setDate(now.getDate() - 30);
            matchDate = d >= from && d <= now;
          } else if (filters.lastConnection === 'custom' && filters.customDate) {
            const start = new Date(filters.customDate); start.setHours(0,0,0,0);
            const end   = new Date(filters.customDate); end.setHours(23,59,59,999);
            matchDate = d >= start && d <= end;
          }
        }
      }
    }

    return matchSearch && matchRole && matchStatus && matchDate;
  });

  setFilteredUsers(next);
}, [users, searchTerm, filters]);


  const handleSearch = (term: string) => setSearchTerm(term);

  const handleDeleteUser = async (userId: string | number) => {
    try {
      const res = await fetch(`http://localhost:5000/api/v1/users/organizations/2/users/${userId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Erreur lors de la suppression: ${res.status}`);
      setUsers(prev => prev.filter(u => u.id !== Number(userId)));
      setFilteredUsers(prev => prev.filter(u => u.id !== Number(userId))); // évite un “flash”
    } catch (e) {
      console.error(e);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Erreur de chargement</h2>
          <p className="text-red-600">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2">
      <UserStats users={users} />
      <SearchBar
        onSearch={handleSearch}
        resultsCount={filteredUsers.length}
        onApplyFilters={setFilters}               // ⬅️ branchement principal
        rolesOptions={rolesOptions}               // ⬅️ options dynamiques
        statusesOptions={statusesOptions}         // ⬅️ options dynamiques
      />
      <UserTable
        users={filteredUsers}
        isLoading={isLoading}
        onDeleteUser={handleDeleteUser}
      />
    </div>
  );
};

export default UsersPage;
