'use client';

import React, { useEffect, useMemo, useState, useCallback } from "react";

import { NEXT_PUBLIC_API_UR } from "@/app/_constantes/api_constants";
import type { FilterOptions } from "@/components/admin/FilterPopup";
import SearchBar from "@/components/admin/SearchBar";
import UserStatst from "@/components/admin/UserStatst";
import UserTable from "@/components/admin/UserTable";

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
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    role: [],
    status: [],
    lastConnection: '',
    customDate: '',
  });

  // Fonction de recherche locale
  const filterUsersBySearchTerm = (users: User[], term: string) => {
    if (!term.trim()) return users;

    const searchLower = term.toLowerCase();
    return users.filter(user =>
      user.email.toLowerCase().includes(searchLower) ||
      user.username.toLowerCase().includes(searchLower) ||
      user.firstName.toLowerCase().includes(searchLower) ||
      user.lastName.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
    );
  };

  // Filtrer les utilisateurs en fonction du terme de recherche et des filtres
  const filteredUsers = useMemo(() => {
    let result = [...users];

    // Appliquer la recherche textuelle
    result = filterUsersBySearchTerm(result, searchTerm);

    // Appliquer les filtres
    if (filters.role.length > 0) {
      result = result.filter(user =>
        filters.role.map(r => r.toLowerCase()).includes(user.role.toLowerCase())
      );
    }

    if (filters.status.length > 0) {
      result = result.filter(user =>
        filters.status.includes(user.status)
      );
    }

    // Gérer le filtre de dernière connexion si nécessaire
    // ... (le code existant pour les filtres de date peut rester inchangé)

    return result;
  }, [users, searchTerm, filters]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour construire l'URL de filtrage
  const buildFilterUrl = useCallback((searchTerm: string, filters: FilterOptions) => {
    const baseUrl = `${NEXT_PUBLIC_API_UR}users/organisations/37/users`;
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
  }, []);

  // fonction  pour charger les utilisateurs avec filtres
  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const url = buildFilterUrl('', filters); // On ne passe plus le searchTerm ici

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);

      const api: ApiResponse = await res.json();
      if (api.status !== 'success' || !Array.isArray(api.data)) {
        throw new Error('Format de réponse API inattendu');
      }

      setUsers(api.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [buildFilterUrl, filters]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  
  useEffect(() => {
    if (searchTerm) return; 
    loadUsers();
  }, [filters.role, filters.status, filters.lastConnection, filters.customDate, loadUsers, searchTerm]);

  

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
      <UserTable
        users={filteredUsers}
        isLoading={isLoading}
      />

    </div>
  );
};

export default UsersPage;