// frontend/components/admin/UserCreationForm.tsx
"use client";

import { useState } from 'react';

import { FormInput } from '@/components/forms/FormInput';
import { FormSelect } from '@/components/forms/FormSelect';

import { Button } from '../ui/button';
import { Card } from '../ui/card';


interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
}

interface UserCreationFormProps {
  onUserCreated?: (user: any) => void;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    department?: string;
  };
}

const UserCreationForm = ({ onUserCreated, user }: UserCreationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    role: user?.role || "user",
    department: user?.department || ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulation d'appel API
      setTimeout(() => {
        const newUser = {
          id: Math.random().toString(36).substr(2, 9),
          ...formData,
          status: 'active',
          nbreFormations: 0,
          lastLogin: null
        };
        
        if (onUserCreated) {
          onUserCreated(newUser);
        }
        
        alert('Utilisateur créé avec succès!');
        
        // Réinitialiser le formulaire si ce n'est pas une édition
        if (!user) {
          setFormData({
            firstName: "",
            lastName: "",
            email: "",
            role: "user",
            department: ""
          });
        }
        
        setIsSubmitting(false);
      }, 1000);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      alert('Erreur lors de la création de l\'utilisateur');
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">
          {user ? 'Modifier l\'utilisateur' : 'Créer un nouvel utilisateur'}
        </h2>
        <p className="text-gray-600 mt-1">
          {user ? 'Modifiez les informations de l\'utilisateur' : 'Ajoutez un nouveau collaborateur à votre organisation'}
        </p>
      </div>
      
      <div className="px-6 py-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Prénom"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              placeholder="Saisissez le prénom"
            />
            
            <FormInput
              label="Nom"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              placeholder="Saisissez le nom"
            />
          </div>
          
          <FormInput
            label="Email"
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="email@exemple.com"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="Rôle"
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              options={[
                { value: 'user', label: 'Utilisateur' },
                { value: 'admin', label: 'Administrateur' },
                { value: 'manager', label: 'Manager' }
              ]}
            />
            
            <FormSelect
              label="Département"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              options={[
                { value: '', label: 'Sélectionnez un département' },
                { value: 'sales', label: 'Ventes' },
                { value: 'marketing', label: 'Marketing' },
                { value: 'it', label: 'IT' },
                { value: 'hr', label: 'Ressources Humaines' },
                { value: 'finance', label: 'Finance' },
                { value: 'development', label: 'Développement' },
                { value: 'support', label: 'Support' },
                { value: 'design', label: 'Design' },
                { value: 'operations', label: 'Operations' }
              ]}
            />
          </div>
          
          <Button
            type="submit"
            disabled={isSubmitting}
            // isLoading={isSubmitting}
            className="w-full"
          >
            {user ? 'Modifier l\'utilisateur' : 'Créer l\'utilisateur'}
          </Button>
        </form>
      </div>
    </Card>
  );
};

export default UserCreationForm;