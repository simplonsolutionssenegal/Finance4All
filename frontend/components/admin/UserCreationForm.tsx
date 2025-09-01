// frontend/components/admin/UserCreationForm.tsx
"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { toast } from "sonner";

import { FormInput } from "@/components/forms/FormInput";
import { FormSelect } from "@/components/forms/FormSelect";
// import { Button } from "../ui/button";
import { Button } from "@/components/ui/button";

interface User {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
}

interface UserCreationFormProps {
  onUserCreated?: (user: User) => void;
  user?: User | null;
}

interface FormData {
  fullName: string;
  email: string;
  role: string;
}

const UserCreationForm: React.FC<UserCreationFormProps> = ({
  onUserCreated,
  user,
}) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    fullName:
      user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : "",
    email: "",
    role: "user",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (user) {
      setFormData({
        fullName:
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : "",
        email: user.email || "",
        role: user.role || "user",
      });
    }
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          "Utilisateur créé avec succès. Un email d'activation a été envoyé."
        );
        setFormData({
          fullName: "",
          email: "",
          role: "user",
        });
        if (onUserCreated) onUserCreated(data.user);
      } else {
        alert(data.message || "Une erreur est survenue lors de la création.");
      }
    } catch (error) {
      alert("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-2 bg-white rounded-lg shadow overflow-hidden">
      <div className="px-3 py-2">
        <h2 className="text-2xl font-bold text-gray-800">
          {user ? "Modifier utilisateur" : "Ajouter un nouvel utilisateur"}
        </h2>
      </div>
      <div className="px-2 py-1">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <FormInput
              label="Nom complet"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="Saisissez le nom complet"
              className="w-50"
            />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <FormInput
              label="Email"
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="email@exemple.com"
              className="w-50"
            />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <FormSelect
              label="Rôle"
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              options={[
                { value: "user", label: "Utilisateur" },
                { value: "admin", label: "Administrateur" },
              ]}
              className="w-50"
            />
          </div>
          <Button
            type="submit"
            variant="default"
            disabled={isSubmitting}
            // isLoading={isSubmitting}
            className="w-full md:w-auto bg-[#6CB9C6] hover:bg-[#5AA7B3] text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {user ? "Modifier utilisateur" : "Enregistrer"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default UserCreationForm;
