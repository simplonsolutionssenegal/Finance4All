// frontend/components/admin/UserTable.jsx
import { SquarePen, Trash2 } from 'lucide-react';
import { useState } from 'react';


import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";

import ConfirmationDialog from './ConfirmationDialog';

const UserTable = ({ users, isLoading, onDeleteUser }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const paginatedUsers = users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const getStatusBadge = (status) => {
    const statusConfig = {
      ACTIF: { color: 'bg-green-100 text-green-800', label: 'Actif' },
      EN_ATTENTE: { color: 'bg-yellow-100 text-yellow-800', label: 'En attente' },
      INACTIF: { color: 'bg-gray-100 text-gray-800', label: 'Inactif' },
      SUSPENDU: { color: 'bg-red-100 text-red-800', label: 'Suspendu' }
    };
    
    const config = statusConfig[status] || statusConfig.INACTIF;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatLastLogin = (lastLoginAt) => {
    if (!lastLoginAt) return 'Jamais';
    const date = new Date(lastLoginAt);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const confirmDelete = () => {
    if (userToDelete) {
      onDeleteUser(userToDelete);
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setUserToDelete(null);
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
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun utilisateur</h3>
          <p className="mt-1 text-sm text-gray-500">Commencez par ajouter un nouvel utilisateur.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 mb-12">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-md font-bold text-black-900 tracking-wider">
                  Utilisateur
                </th>
                <th scope="col" className="px-6 py-3 text-left text-md font-bold text-black-900 tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-md font-bold text-black-900 tracking-wider">
                  Rôle 
                </th>
                <th scope="col" className="px-6 py-3 text-left text-md font-bold text-black-900 tracking-wider">
                  Organisation
                </th>
                <th scope="col" className="px-6 py-3 text-left text-md font-bold text-black-900 tracking-wider">
                  Statut
                </th>
                <th scope="col" className="px-6 py-3 text-left text-md font-bold text-black-900 tracking-wider">
                  Dernière connexion
                </th>
                <th scope="col" className="px-6 py-3 text-left text-md font-bold text-black-900 tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 mb-12">
              {paginatedUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName || 'N/A'} {user.lastName || ''}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{user.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {user.role ? user.role.name : 'Aucun rôle'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.organization ? user.organization.name : 'Aucune organisation'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatLastLogin(user.lastLoginAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Dialog open={editOpen} onOpenChange={setEditOpen}>
                        <DialogTrigger asChild>
                          <button 
                            title="Modifier" 
                            className="p-1 rounded hover:bg-gray-100 transition-colors"
                            aria-label={`Modifier ${user.firstName} ${user.lastName}`}
                          >
                            {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 hover:text-blue-900" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M17.414 2.586a2 2 0 00-2.828 0l-9.192 9.192a2 2 0 00-.497.879l-1.414 4.243a1 1 0 001.263 1.263l4.243-1.414a2 2 0 00.879-.497l9.192-9.192a2 2 0 000-2.828zM15 4l1 1-9.192 9.192-1-1L15 4z" />
                            </svg> */}
                            <SquarePen className="h-5 w-5 text-blue-600 hover:text-blue-900 cursor-pointer" />
                          </button>
                        </DialogTrigger>
                      </Dialog>
                      <button 
                        title="Supprimer"
                        className="p-1 rounded hover:bg-gray-100 transition-colors"
                        aria-label={`Supprimer ${user.firstName} ${user.lastName}`}
                      >
                        {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 hover:text-red-900" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                          <path fillRule="evenodd" d="M4 6a1 1 0 011-1h10a1 1 0 011 1v1H4V6zm2 2v6a2 2 0 002 2h4a2 2 0 002-2V8H6z" clipRule="evenodd" />
                        </svg> */}
                        <Trash2 className="h-5 w-5 text-red-600 hover:text-red-900 cursor-pointer" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-center items-center py-4 gap-2">
            <button
              className="px-4 py-2 rounded text-white disabled:opacity-50 bg-[#6CB9C6] hover:bg-[#5aa8b5] transition-colors"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Page précédente"
            >
              Précédent
            </button>
            <span className="text-sm text-gray-700">Page {currentPage} sur {totalPages}</span>
            <button
              className="px-4 py-2 rounded text-white disabled:opacity-50 bg-[#6CB9C6] hover:bg-[#5aa8b5] transition-colors"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Page suivante"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible."
      />
    </>
  );
};

export default UserTable;