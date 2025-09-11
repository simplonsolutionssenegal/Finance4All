// frontend/pages/admin/users/index.js
'use client';

import { useEffect, useState, type SetStateAction } from 'react';

import SearchBar from '@/components/admin/SearchBar';
import type { UserFilters } from '@/components/admin/UserFilter';
import UserStats from '@/components/admin/UserStats';
import UserTable from '@/components/admin/UserTable';
import EmptyState from '@/components/ui/empty-state';

type Role = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

type Organization = {
  id: string;
  name: string;
  type: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type User = {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  roleId: string;
  organizationId: string | null;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  role?: Role;
  organization?: Organization | null;
};

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<UserFilters>({
    status: [],
    roleId: [],
    organizationId: [],
    dateRange: 'recent',
    customDate: null,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Fetch users with search and filters
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        
        // Build search parameters
        const params = new URLSearchParams();
        
        if (searchTerm.trim()) {
          params.append('search', searchTerm.trim());
        }
        
        // Add filter parameters
        currentFilters.status.forEach(status => params.append('status', status));
        currentFilters.roleId.forEach(roleId => params.append('roleId', roleId));
        currentFilters.organizationId.forEach(orgId => params.append('organizationId', orgId));
        
        if (currentFilters.dateRange) {
          params.append('dateRange', currentFilters.dateRange);
        }
        
        if (currentFilters.customDate) {
          params.append('customDate', currentFilters.customDate.toISOString());
        }
        
        params.append('page', pagination.page.toString());
        params.append('limit', pagination.limit.toString());
        params.append('sortBy', 'firstName');
        params.append('sortOrder', 'asc');
        
        const url = `http://localhost:5000/api/v1/users/search?${params.toString()}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Handle paginated response
        if (data && typeof data === 'object' && 'users' in data) {
          setUsers(data.users);
          setPagination({
            page: data.page,
            limit: data.limit,
            total: data.total,
            totalPages: data.totalPages
          });
        } else if (Array.isArray(data)) {
          // Fallback for direct array response
          setUsers(data);
        } else {
          throw new Error('Format de réponse invalide');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des users:', error);
        setError(error instanceof Error ? error.message : 'Erreur lors du chargement des utilisateurs');
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [searchTerm, currentFilters, pagination.page, pagination.limit]);


  const handleSearch = (term: SetStateAction<string>) => {
    setSearchTerm(term);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleFiltersChange = (filters: UserFilters) => {
    setCurrentFilters(filters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleResetFilters = () => {
    const resetFilters: UserFilters = {
      status: [],
      roleId: [],
      organizationId: [],
      dateRange: 'recent',
      customDate: null,
    };
    setCurrentFilters(resetFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    // Supprimer les filtres de la session
    sessionStorage.removeItem('finance4all_user_filters');
  };

  // Fonction pour détecter si des filtres sont actifs
  const hasActiveFilters = () => {
    return (
      searchTerm.length > 0 ||
      currentFilters.status.length > 0 ||
      currentFilters.roleId.length > 0 ||
      currentFilters.organizationId.length > 0 ||
      (currentFilters.dateRange && currentFilters.dateRange !== 'recent') ||
      !!currentFilters.customDate
    );
  };

  const handleDeleteUser = (userId: string) => {
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
  };

  return (
    
    
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des utilisateurs</h1>
          <p className="text-gray-600 mt-2">Gérez les utilisateurs de votre organisation</p>
        </div>

        <UserStats users={users} />
        <SearchBar 
          onSearch={handleSearch} 
          resultsCount={pagination.total}
          onFiltersChange={handleFiltersChange}
          currentFilters={currentFilters}
          onResetFilters={handleResetFilters}
        />
        
        {error ? (
          <EmptyState
            type="loading-error"
            title="Erreur de chargement"
            description={error}
            icon="error"
            action={{
              label: "Réessayer",
              onClick: () => {
                setError(null);
                setIsLoading(true);
              }
            }}
          />
        ) : users.length === 0 && !isLoading ? (
          hasActiveFilters() ? (
            <EmptyState
              type="no-results"
              title="Aucun résultat trouvé"
              description="Vos critères de recherche et filtres ne correspondent à aucun utilisateur. Essayez de modifier vos filtres."
              icon="search"
              action={{
                label: "Réinitialiser les filtres",
                onClick: handleResetFilters
              }}
            />
          ) : (
            <EmptyState
              type="no-data"
              title="Aucun utilisateur dans le système"
              description="Il n'y a actuellement aucun utilisateur enregistré dans la base de données."
              icon="users"
            />
          )
        ) : (
          <UserTable 
            users={users} 
            isLoading={isLoading}
            onDeleteUser={handleDeleteUser}
          />
        )}
      </div>

  );
};

export default UsersPage;