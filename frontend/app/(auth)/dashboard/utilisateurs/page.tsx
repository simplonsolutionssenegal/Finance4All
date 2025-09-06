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

  // Fonction pour construire l'URL de filtrage
  const buildFilterUrl = (searchTerm: string, filters: FilterOptions) => {
    const baseUrl = `${NEXT_PUBLIC_API_UR}users/organizations/37/users`;
    console.log('Base URL:', baseUrl);
    // Si pas de filtres actifs et pas de recherche, utiliser l'endpoint classique
    const hasActiveFilters = filters.role.length > 0 || filters.status.length > 0 || filters.lastConnection;
    
    if (!hasActiveFilters && !searchTerm.trim()) {
      return baseUrl;
    }

    // Sinon utiliser l'endpoint de filtrage
    const filterUrl = `${baseUrl}/filter`;
    const params = new URLSearchParams();

    // Ajouter les statuts
    filters.status.forEach(status => {
      // Mapper les valeurs frontend vers backend
      let backendStatus = status;
      if (status === 'ACTIF') backendStatus = 'ACTIF';
      else if (status === 'INACTIF') backendStatus = 'INACTIF';
      else if (status === 'PENDING') backendStatus = 'EN_ATTENTE';
      
      params.append('status', backendStatus);
    });

    // Ajouter les rôles
    filters.role.forEach(role => {
      params.append('role', role.toLowerCase());
    });

    // Ajouter la dernière connexion
    if (filters.lastConnection) {
      params.append('lastLogin', filters.lastConnection);
      
      if (filters.lastConnection === 'custom' && filters.customDate) {
        params.append('customDate', filters.customDate);
      }
    }

    // Ajouter la recherche si présente
    if (searchTerm.trim()) {
      params.append('search', searchTerm.trim());
    }

    return `${filterUrl}?${params.toString()}`;
  };

  // Fonction pour charger les utilisateurs avec filtres
  const loadUsers = async (searchTerm: string = '', filters: FilterOptions) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const url = buildFilterUrl(searchTerm, filters);
      console.log('Fetching URL:', url); // Pour debug
      
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
      
      const api: ApiResponse = await res.json();
      if (api.status !== 'success' || !Array.isArray(api.data)) {
        throw new Error('Format de réponse API inattendu');
      }
      
      setUsers(api.data);
      setFilteredUsers(api.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Chargement initial
  useEffect(() => {
    loadUsers('', {
      role: [],
      status: [],
      lastConnection: '',
      customDate: '',
    });
  }, []);


  useEffect(() => {
    loadUsers(searchTerm, filters);
  }, [searchTerm, filters]);

  // 📋 Options dynamiques pour le popup (on garde la logique existante pour les options)
  const rolesOptions = useMemo(
    () => Array.from(new Set(users.map(u => (u.role ?? '').toLowerCase()))).filter(Boolean).sort(),
    [users]
  );
  const statusesOptions = useMemo(
    () => Array.from(new Set(users.map(u => (u.status ?? '').toUpperCase()))).filter(Boolean).sort(),
    [users]
  );

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // Le useEffect se chargera de faire l'appel API
  };

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    // Le useEffect se chargera de faire l'appel API
  };

  // const handleDeleteUser = async (userId: string | number) => {
  //   try {
  //     const res = await fetch(`http://localhost:5000/api/v1/users/organizations/2/users/${userId}`, { method: 'DELETE' });
  //     if (!res.ok) throw new Error(`Erreur lors de la suppression: ${res.status}`);
      
  //     // Recharger les données après suppression
  //     loadUsers(searchTerm, filters);
  //   } catch (e) {
  //     console.error(e);
  //   }
  // };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Erreur de chargement</h2>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => loadUsers(searchTerm, filters)} 
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
      <UserStats users={users} />
      <SearchBar
        onSearch={handleSearch}
        resultsCount={filteredUsers.length}
        onApplyFilters={handleApplyFilters}
        rolesOptions={rolesOptions}
        statusesOptions={statusesOptions}
      />
      <UserTable
        users={filteredUsers}
        isLoading={isLoading}
       
      />
    </div>
  );
};

export default UsersPage;