"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon, SearchIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { AddInstitutionDialog } from "@/components/admin/institution-financiere/add-institution-dialog";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function InstitutionFinancierePage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Données de démo pour les institutions financières
  const institutions = [
    { 
      id: 1, 
      nom: "Société générale", 
      type: "Banque",
      statut: "Actif"
    },
    { 
      id: 2, 
      nom: "Société générale", 
      type: "Banque", 
      statut: "Actif" 
    },
    { 
      id: 3, 
      nom: "Société générale", 
      type: "Banque", 
      statut: "Actif" 
    },
  ];

  return (
    <div className="w-full">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="p-6 relative overflow-hidden">
          <div className="absolute top-6 left-6 bg-blue-100 rounded-full p-3">
            <span className="text-blue-500 text-xl">📋</span>
          </div>
          <div className="ml-16">
            <h3 className="text-sm text-gray-500">Terminés</h3>
            <p className="text-3xl font-bold">12,350</p>
            <p className="text-sm text-green-500">7,332 Lorem ipsum</p>
          </div>
        </Card>
        
        <Card className="p-6 relative overflow-hidden">
          <div className="absolute top-6 left-6 bg-blue-100 rounded-full p-3">
            <span className="text-blue-500 text-xl">🛡️</span>
          </div>
          <div className="ml-16">
            <h3 className="text-sm text-gray-500">En attente</h3>
            <p className="text-3xl font-bold">134,640.00</p>
            <p className="text-sm text-green-500">13% Lorem ipsum</p>
          </div>
        </Card>
      </div>

      {/* En-tête de la liste */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <h1 className="text-2xl font-bold">Liste des institutions</h1>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              placeholder="Rechercher..." 
              className="pl-10 pr-4 py-2 w-full" 
            />
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-teal-500 hover:bg-teal-600">
            <PlusIcon className="mr-2 h-4 w-4" />
            Ajouter une institut
          </Button>
        </div>
      </div>

      {/* Tableau des institutions */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Nom de l'institut</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Statut</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {institutions.map((institution) => (
              <tr key={institution.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 text-sm text-gray-900">{institution.nom}</td>
                <td className="px-4 py-4 text-sm text-gray-500">{institution.type}</td>
                <td className="px-4 py-4 text-sm">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    {institution.statut}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-right space-x-2">
                  <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-700">
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddInstitutionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}
