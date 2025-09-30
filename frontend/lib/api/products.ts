// frontend/lib/api/products.ts

import type { Product, ProductsResponse, ProductFilters } from '@/types/Product';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export class ProductsAPI {
  private static async fetchWithErrorHandling<T>(
    url: string,
    // eslint-disable-next-line no-undef
    options?: RequestInit
  ): Promise<T> {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `HTTP error! status: ${response.status}`,
        }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // GET - Récupérer tous les produits
  static async getAllProducts(
    page: number = 1,
    limit: number = 10,
    filters?: ProductFilters
  ): Promise<ProductsResponse> {
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const url = `${API_BASE_URL}/api/v1/products?${searchParams}`;
    return this.fetchWithErrorHandling<ProductsResponse>(url);
  }

  // GET - Récupérer un produit par ID
  static async getProductById(id: string): Promise<Product> {
    const url = `${API_BASE_URL}/api/v1/products/${id}`;
    const response = await this.fetchWithErrorHandling<{ status: string; data: Product }>(url);
    return response.data;
  }

  // POST - Créer un nouveau produit
  static async createProduct(productData: Partial<Product>): Promise<Product> {
    const url = `${API_BASE_URL}/api/v1/products`;
    const response = await this.fetchWithErrorHandling<{ status: string; data: Product }>(url, {
      method: 'POST',
      body: JSON.stringify(productData),
    });
    return response.data;
  }

  // PUT - Mettre à jour un produit
  static async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    const url = `${API_BASE_URL}/api/v1/products/${id}`;
    const response = await this.fetchWithErrorHandling<{ status: string; data: Product }>(url, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
    return response.data;
  }

  // DELETE - Supprimer un produit
  static async deleteProduct(id: string): Promise<void> {
    const url = `${API_BASE_URL}/api/v1/products/${id}`;
    await this.fetchWithErrorHandling<{ status: string; message: string }>(url, {
      method: 'DELETE',
    });
  }

  // GET - Récupérer les produits par type
  static async getProductsByType(type: string): Promise<Product[]> {
    const response = await this.getAllProducts(1, 100, { type });
    return response.data;
  }

  // GET - Rechercher des produits
  static async searchProducts(query: string): Promise<Product[]> {
    const url = `${API_BASE_URL}/api/v1/products/search?q=${encodeURIComponent(query)}`;
    const response = await this.fetchWithErrorHandling<ProductsResponse>(url);
    return response.data;
  }
}
