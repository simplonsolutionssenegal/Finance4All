// frontend/hooks/products/useProductOperations.tsx

'use client';

import { toast } from 'sonner';

import { useLoader } from '@/contexts/LoaderContext';
import type { Product } from '@/types/Product';

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

// 🔧 Fonction utilitaire pour gérer les appels API
async function handleApiCall(
  url: string,
  method: string,
  body: object | null,
  showLoader: () => void,
  hideLoader: () => void,
  successMessage: string,
  errorMessage: string
): Promise<BackendResponse> {
  showLoader();

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (!response.ok) {
      const errorData: BackendErrorResponse = await response.json().catch(() => ({
        message: `Erreur HTTP ${response.status}: ${response.statusText}`,
      }));

      hideLoader();
      toast.error(errorMessage, {
        description: errorData.message || 'Une erreur est survenue. Veuillez réessayer.',
      });
      throw new Error(
        errorData.message || `Erreur HTTP ${response.status}: ${response.statusText}`
      );
    }

    const result: BackendResponse = await response.json();

    if (result.status !== 'success') {
      hideLoader();
      toast.error(errorMessage, {
        description: result.message || 'Une erreur est survenue. Veuillez réessayer.',
      });
      throw new Error(result.message || "L'API a retourné un statut d'erreur");
    }

    hideLoader();
    toast.success(successMessage, {
      description: result.message,
    });

    return result;
  } catch (error: unknown) {
    hideLoader();
    if (error instanceof Error) {
      toast.error(errorMessage, {
        description: error.message || 'Une erreur est survenue. Veuillez réessayer.',
      });
    }
    throw error;
  }
}

// Hook pour supprimer un produit
export const useRemoveProduct = () => {
  const { showLoader, hideLoader } = useLoader();

  const removeProduct = async (productId: string) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/products/${productId}`;
    await handleApiCall(
      url,
      'DELETE',
      null,
      showLoader,
      hideLoader,
      'Produit supprimé avec succès',
      'Échec de la suppression'
    );
    return { success: true };
  };

  return { removeProduct };
};

// Hook pour mettre à jour un produit
export const useUpdateProduct = (options?: { reloadFn?: () => void }) => {
  const { showLoader, hideLoader } = useLoader();
  const reloadFn = options?.reloadFn || (() => globalThis.location.reload());

  const updateProduct = async (productId: string, productData: Partial<CreateProductData>) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/products/${productId}`;
    const result = await handleApiCall(
      url,
      'PUT',
      productData,
      showLoader,
      hideLoader,
      'Produit mis à jour avec succès',
      'Échec de la mise à jour'
    );

    setTimeout(() => {
      reloadFn();
    }, 1500);

    return { success: true, data: result.data };
  };

  return { updateProduct };
};

// Hook pour créer un produit
export const useCreateProduct = (options?: { reloadFn?: () => void }) => {
  const { showLoader, hideLoader } = useLoader();
  const reloadFn = options?.reloadFn || (() => globalThis.location.reload());

  const createProduct = async (productData: CreateProductData) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/products`;
    const result = await handleApiCall(
      url,
      'POST',
      productData,
      showLoader,
      hideLoader,
      'Produit créé avec succès',
      'Échec de la création'
    );

    setTimeout(() => {
      reloadFn();
    }, 1500);

    return { success: true, data: result.data };
  };

  return { createProduct };
};

// Hook combiné (optionnel)
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
