// frontend/src/lib/api/modules.ts
import type { Module, CreateModuleData } from '@/types/modules/module';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

export async function createModule(data: CreateModuleData): Promise<Module> {
  const response = await fetch(`${API_BASE_URL}/modules`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erreur lors de la création du module');
  }
  const result: ApiResponse<Module> = await response.json();
  return result.data;
}

export async function getModules(): Promise<Module[]> {
  const url = `${API_BASE_URL}/modules`;
  try {
    const response = await fetch(url, {
      cache: 'no-store',
    });

    if (!response.ok) {
      let errorMessage = `Erreur HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        console.error("Détail de l'erreur:", errorData);
      } catch (_e) {
        console.error("Impossible de parser l'erreur JSON");
      }
      throw new Error(errorMessage);
    }

    const result: ApiResponse<Module[]> = await response.json();
    return result.data;
  } catch (error) {
    console.error('Erreur dans getModules:', error);
    throw error;
  }
}
