'use client';

import { useState } from 'react';

import UsersList from '@/components/users/UsersList';
import UserStatsCards from '@/components/users/UserStatsCards';

const UsersPage = () => {
  const [selectedRole, setSelectedRole] = useState<string>('all');

  const handleFilterChange = (role: string) => {
    setSelectedRole(role);
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-6xl text-tertiary-400 tracking-tight leading-tight mb-1'>
          Gestion des utilisateurs
        </h1>
        <p className='text-lg text-tertiary-400/60 text-muted-foreground font-normal tracking-normal'>
          Administration complète de la plateforme Finance4All
        </p>
      </div>

      {/* Stats Cards */}
      <UserStatsCards onFilterChange={handleFilterChange} selectedRole={selectedRole} />

      {/* Table */}
      <UsersList selectedRole={selectedRole} onRoleChange={setSelectedRole} />
    </div>
  );
};

export default UsersPage;
