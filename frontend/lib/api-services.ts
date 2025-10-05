// frontend/lib/api/services.ts
import type { Service } from '@/models/service';
import type { ApiResponse } from '@/types/ApiResponse';
import type { FilterOptions } from '@/types/FilterOptions';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'}/api/v1`;

type ServicesListResponse = ApiResponse<Service>;
type FetchOptions = Parameters<typeof fetch>[1]; // ← évite RequestInit (no-undef)

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
      // garder error (autorisé par ta règle)

      console.error('ServicesAPI error:', err);
      throw err;
    }
  }

  /** Construit la query ?type=…&zone=…&date=… à partir de FilterOptions */
  private static buildFilterQuery(filters: FilterOptions): string {
    const params = new URLSearchParams();
    filters.type.forEach(t => params.append('type', t));
    filters.zone.forEach(z => params.append('zone', z));
    if (filters.date) params.set('date', filters.date);
    return params.toString();
  }

  /** GET: /service/by-institution/:id  (liste brute) */
  static async getByInstitution(institutionId: string): Promise<Service[]> {
    const url = `${API_BASE_URL}/service/by-institution/${institutionId}`;
    const resp = await this.fetchJSON<ServicesListResponse>(url);

    if (resp.status !== 'success' || !Array.isArray(resp.data)) return [];
    return resp.data;
  }

  /** GET: /service/by-institution/:id/filter?type=…&zone=…&date=… */
  static async filterByInstitution(
    institutionId: string,
    filters: FilterOptions
  ): Promise<Service[]> {
    const qs = this.buildFilterQuery(filters);
    const url = `${API_BASE_URL}/service/by-institution/${institutionId}/filter?${qs}`;
    const resp = await this.fetchJSON<ServicesListResponse>(url);
    if (resp.status !== 'success' || !Array.isArray(resp.data)) return [];
    return resp.data;
  }
}
