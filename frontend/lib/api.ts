// Types globaux pour les appels fetch
type RequestInit = {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  [key: string]: unknown;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  userId: string;
  newPassword: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
}

export interface ResetPasswordResponse {
  success: boolean;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  //Effectue un appel API avec gestion d'erreurs
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Si la réponse n'est pas ok, on retourne l'erreur du serveur
        return {
          status: 'error',
          message: data.message || `Erreur HTTP ${response.status}`,
          data: data.data,
        };
      }

      return data;
    } catch (error) {
      // Erreur réseau ou de parsing JSON
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Erreur réseau inconnue',
      };
    }
  }

  async forgotPassword(email: string): Promise<ApiResponse<ForgotPasswordResponse>> {
    return this.request<ForgotPasswordResponse>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(userId: string, newPassword: string): Promise<ApiResponse<ResetPasswordResponse>> {
    return this.request<ResetPasswordResponse>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ userId, newPassword }),
    });
  }
}

export const apiClient = new ApiClient();