// frontend/components/admin/UserTable.tsx
"use client";

import { useState } from "react";

import UserCreationForm from "@/components/admin/UserCreationForm";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { SquarePen, Trash2 } from 'lucide-react';

interface User  {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  avatar: string;
  isActive: boolean;
  lastLoginAt: string;
  organisationId: number;
  organisation: {
    id: number;
    name: string;
    avatar: string;
    address: string;
    phone: string;
    createdAt: string;
    updatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
};
interface UserTableProps {
  users: User[];
  isLoading: boolean;
  onDeleteUser: (id: string | number) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  isLoading,
  onDeleteUser,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const paginatedUsers = users.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { color: string; label: string }
    > = {
      ACTIF: { color: "text-green-600 text-sm", label: "Actif" },
      inactive: { color: "bg-[#6CB9C6] text-white", label: "Inactif" },
      pending: { color: "bg-[#134B4C] text-white", label: "En attente" },
    };

    const config = statusConfig[status] || statusConfig.inactive;

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<
      string,
      { color: string; label: string }
    > = {
      admin: { color: "bg-purple-100  text-purple-800", label: "Administrateur" },
      manager: { color: "bg-blue-100 text-blue-800", label: "Manager" },
      user: { color: "bg-gray-100 text-gray-800", label: "Utilisateur" },
    };

    const config = roleConfig[role] || roleConfig.user;

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Aucun utilisateur
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Commencez par ajouter un nouvel utilisateur.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white   overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
         <thead className="bg-[#EAEAEA] text-black-900 text-sm font-bold">

            <tr>
              <th
                scope="col"
                className="px-2 py-3 text-left text-xs   uppercase tracking-wider"
              >
                Nom et Prénom
              </th>
              <th
                scope="col"
                className="px-2 py-3 text-left text-xs   uppercase tracking-wider"
              >
                Roles
              </th>
              <th
                scope="col"
                className="px-2 py-3 text-left text-xs   uppercase tracking-wider"
              >
                Email
              </th>
              <th
                scope="col"
                className="px-2 py-3 text-left text-xs   uppercase tracking-wider"
              >
                Dernière connexion
              </th>
              <th
                scope="col"
                className="px-2 py-3 text-left text-xs   uppercase tracking-wider"
              >
                Statut
              </th>
              <th
                scope="col"
                className="px-2 py-3 text-left text-xs   uppercase tracking-wider"
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {paginatedUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-2 py-2 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-[#6CB9C6] flex items-center justify-center">
                        <span className="text-white font-medium">
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                      {/* <div className="text-sm text-gray-500">
                        {user.email}
                      </div> */}
                    </div>
                  </div>
                </td>
                <td className="px-2 py-2 whitespace-nowrap">
                  {user.role}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500">
                  {user.lastLoginAt}
                </td>
                <td className="px-2 py-2 whitespace-nowrap">
                  {getStatusBadge(user.status)}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">

                    <Dialog open={editOpen} onOpenChange={setEditOpen}>
                      <DialogTrigger asChild>
                        <button
                          type="button"
                          title="Modifier"
                          aria-label={`Modifier ${user.firstName} ${user.lastName}`}
                          onClick={() => setEditUser(user)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded  hover:bg-blue-700"
                        >
                          <SquarePen className="h-4 w-4 text-blue-600" strokeWidth={2.5} />
                        </button>
                      </DialogTrigger>
                      <DialogContent>
                        <UserCreationForm onUserCreated={() => setEditOpen(false)} user={editUser} />
                      </DialogContent>
                    </Dialog>

                    <button
                      type="button"
                      onClick={() => onDeleteUser(user.id)}
                      title="Supprimer"
                      aria-label={`Supprimer ${user.firstName} ${user.lastName}`}
                      className="inline-flex h-7 w-7 items-center justify-center rounded bg-red-50 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" strokeWidth={2.5} />
                    </button>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-center items-center py-4 gap-2 border-t-1 border-b-1 border-t-[#EAEAEA] border-b-[#EAEAEA]">
          <button
            className="px-3 py-1 rounded text-white disabled:opacity-50"
            style={{ backgroundColor: "#6CB9C6" }}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Précédent
          </button>
          <span className="text-sm text-gray-700">
            Page {currentPage} / {totalPages}
          </span>
          <button
            className="px-3 py-1 rounded text-white disabled:opacity-50"
            style={{ backgroundColor: "#6CB9C6" }}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserTable;
