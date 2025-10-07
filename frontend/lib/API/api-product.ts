// frontend/lib/api/services.ts
import type { Product } from '@/models/product';
import type { ApiResponse } from '@/types/ApiResponse';
import type { FilterOptions } from '@/types/FilterOptions';

function getApiBaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  return `${env}/api/v1`;
}

type ServicesListResponse = ApiResponse<Product>;
type FetchOptions = Parameters<typeof fetch>[1];

export class ServicesAPI {
  private static async fetchJSON<T>(url: string, options?: FetchOptions): Promise<T> {
    try {
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
        cache: 'no-store',
        ...options,
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as { message?: string } | null;
        const msg = payload?.message ?? `HTTP ${res.status} - ${res.statusText}`;
        throw new Error(msg);
      }
      return (await res.json()) as T;
    } catch (err) {
      console.error('ServicesAPI error:', err);
      throw err;
    }
  }

  private static buildFilterQuery(filters: FilterOptions): string {
    const params = new URLSearchParams();
    filters.type.forEach(t => params.append('type', t));
    filters.zone.forEach(z => params.append('zone', z));
    if (filters.date) params.set('date', filters.date);
    return params.toString();
  }

  static async getByInstitution(institutionId: string): Promise<Product[]> {
    const url = `${getApiBaseUrl()}/product/by-institution/${encodeURIComponent(institutionId)}`;
    const resp = await this.fetchJSON<ServicesListResponse>(url);
    if (resp.status !== 'success' || !Array.isArray(resp.data)) return [];
    return resp.data;
  }

  static async filterByInstitution(
    institutionId: string,
    filters: FilterOptions
  ): Promise<Product[]> {
    const qs = this.buildFilterQuery(filters);
    const url = `${getApiBaseUrl()}/product/by-institution/${encodeURIComponent(institutionId)}/filter?${qs}`;
    const resp = await this.fetchJSON<ServicesListResponse>(url);
    if (resp.status !== 'success' || !Array.isArray(resp.data)) return [];
    return resp.data;
  }
}
