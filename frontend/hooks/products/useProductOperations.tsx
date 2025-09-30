// frontend/hooks/useProductOperations.tsx

'use client';

import { toast } from 'sonner';

import { useLoader } from '@/contexts/LoaderContext';
import type { Product } from '@/types/Product';

// Define interfaces for API responses
interface BackendResponse {
  status: string;
  message?: string;
  data?: Product;
}

interface BackendErrorResponse {
  message?: string;
}

interface CreateProductData {
  designation: string;
  type: string;
  montantMinimum: number;
  montantMaximum: number;
  remboursement: {
    dureeMinimum: number;
    dureeMaximum: number;
    modalites: string[];
    tauxInteret: number;
    typeRemboursement: string;
    remboursementAnticipe: boolean;
  };
  conditionsEligibilite: {
    ageMinimum: number;
    revenuMinimum: number;
    situationsProfessionnelles: string[];
    documentsRequis: string[];
    autresConditions: string[];
  };
}

export const useRemoveProduct = () => {
  const { showLoader, hideLoader } = useLoader();

  const removeProduct = async (productId: string) => {
    showLoader();

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/products/${productId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData: BackendErrorResponse = await response.json().catch(() => ({
          message: `Erreur HTTP ${response.status}: ${response.statusText}`,
        }));

        hideLoader();
        toast.error('Échec de la suppression', {
          description:
            errorData.message || 'Impossible de supprimer le produit. Veuillez réessayer.',
        });
        throw new Error(
          errorData.message || `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      const result: BackendResponse = await response.json();

      if (result.status !== 'success') {
        hideLoader();
        toast.error('Échec de la suppression', {
          description: result.message || 'Impossible de supprimer le produit. Veuillez réessayer.',
        });
        throw new Error(result.message || "L'API a retourné un statut d'erreur");
      }

      hideLoader();
      toast.success('Produit supprimé avec succès', {
        description: 'Le produit a été supprimé définitivement.',
      });
      return { success: true };
    } catch (error: unknown) {
      hideLoader();

      if (error instanceof Error) {
        toast.error('Échec de la suppression', {
          description: error.message || 'Impossible de supprimer le produit. Veuillez réessayer.',
        });
      }

      throw error;
    }
  };

  return { removeProduct };
};

export const useUpdateProduct = (options?: { reloadFn?: () => void }) => {
  const { showLoader, hideLoader } = useLoader();
  const reloadFn = options?.reloadFn || (() => window.location.reload());

  const updateProduct = async (productId: string, productData: Partial<CreateProductData>) => {
    showLoader();

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/products/${productId}`;

      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData: BackendErrorResponse = await response.json().catch(() => ({
          message: `Erreur HTTP ${response.status}: ${response.statusText}`,
        }));

        hideLoader();
        toast.error('Échec de la mise à jour', {
          description:
            errorData.message || 'Impossible de mettre à jour le produit. Veuillez réessayer.',
        });
        throw new Error(
          errorData.message || `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      const result: BackendResponse = await response.json();

      if (result.status !== 'success') {
        hideLoader();
        toast.error('Échec de la mise à jour', {
          description:
            result.message || 'Impossible de mettre à jour le produit. Veuillez réessayer.',
        });
        throw new Error(result.message || "L'API a retourné un statut d'erreur");
      }

      hideLoader();
      toast.success('Produit mis à jour avec succès', {
        description: 'Les informations du produit ont été modifiées.',
      });

      // Recharger la page après un court délai
      setTimeout(() => {
        reloadFn();
      }, 1500);

      return { success: true, data: result.data };
    } catch (error: unknown) {
      hideLoader();

      if (error instanceof Error) {
        toast.error('Échec de la mise à jour', {
          description:
            error.message || 'Impossible de mettre à jour le produit. Veuillez réessayer.',
        });
      }

      throw error;
    }
  };

  return { updateProduct };
};

export const useCreateProduct = (options?: { reloadFn?: () => void }) => {
  const { showLoader, hideLoader } = useLoader();
  const reloadFn = options?.reloadFn || (() => window.location.reload());

  const createProduct = async (productData: CreateProductData) => {
    showLoader();

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/products`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        let errorData: BackendErrorResponse;
        try {
          errorData = await response.json();
        } catch (_parseError) {
          errorData = { message: `Erreur HTTP ${response.status}: ${response.statusText}` };
        }

        hideLoader();

        toast.error('Échec de la création', {
          description: errorData.message || 'Impossible de créer le produit. Veuillez réessayer.',
        });
        throw new Error(
          errorData.message || `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      const result: BackendResponse = await response.json();

      if (result.status !== 'success') {
        hideLoader();
        toast.error('Échec de la création', {
          description: result.message || 'Impossible de créer le produit. Veuillez réessayer.',
        });
        throw new Error(result.message || "L'API a retourné un statut d'erreur");
      }

      hideLoader();
      toast.success('Produit créé avec succès', {
        description: `${productData.designation} a été ajouté avec succès.`,
      });

      // Recharger la page après un court délai
      setTimeout(() => {
        reloadFn();
      }, 1500);

      return { success: true, data: result.data };
    } catch (error: unknown) {
      hideLoader();

      if (error instanceof Error) {
        toast.error('Échec de la création', {
          description: error.message || 'Impossible de créer le produit. Veuillez réessayer.',
        });
      }

      throw error;
    }
  };

  return { createProduct };
};

// Hook combiné pour toutes les opérations (optionnel)
export const useProductOperations = (options?: { reloadFn?: () => void }) => {
  const { createProduct } = useCreateProduct(options);
  const { updateProduct } = useUpdateProduct(options);
  const { removeProduct } = useRemoveProduct();

  return {
    createProduct,
    updateProduct,
    removeProduct,
  };
};
