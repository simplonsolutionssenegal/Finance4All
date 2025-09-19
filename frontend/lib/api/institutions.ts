import type { InstitutionFormValues } from '@/components/admin/institution-financiere/validation-schema';
import type {
  InstitutionCreatedResponse,
  InstitutionListItem,
  FetchInstitutionsResult,
} from '@/types/institutions';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Service API pour les institutions financières
 * 
 * Ce module se concentre uniquement sur les appels API,
 * les types étant séparés dans /types/institutions.ts
 * conforme au principe de responsabilité unique (SRP).
 */

export async function createInstitution(values: InstitutionFormValues): Promise<InstitutionCreatedResponse> {
  // Convertir le logo en base64 si présent
  let logoBase64: string | null = null;
  if (values.logo && values.logo instanceof FileList && values.logo.length > 0) {
    const file = values.logo[0];
    logoBase64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  // Adapter si backend attend un autre mapping (ex: regionsDesservies[] -> regionsDesservies)
  const payload = {
    nom: values.nom,
    type: values.type,
    description: values.description,
    siteWeb: values.siteWeb,
    contactNom: values.contactNom,
    contactEmail: values.contactEmail,
    contactTelephone: values.contactTelephone,
    regionsDesservies: values.regionsDesservies,
    logo: logoBase64, // Logo en base64
  };

  const res = await fetch(`${API_BASE}/api/v1/institutions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let detail: string | undefined;
    try {
      const errJson = await res.json();
      detail = errJson?.message || errJson?.error;
    } catch {
      /* ignore */
    }
    throw new Error(detail || 'Erreur lors de la création de linstitution');
  }

  return res.json();
}

export async function fetchInstitutions(): Promise<FetchInstitutionsResult> {
  const res = await fetch(`${API_BASE}/api/v1/institutions`, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error('Erreur lors de la récupération des institutions');
  }

  const data = await res.json();
  
  const institutions: InstitutionListItem[] = Array.isArray(data.data)
    ? data.data.map((i: unknown) => ({ 
        id: (i as { id: string | number }).id, 
        nom: (i as { nom: string }).nom, 
        type: (i as { type: string }).type, 
        statut: (i as { statut?: string }).statut || 'Actif', 
        siteWeb: (i as { siteWeb?: string }).siteWeb 
      }))
    : ((data as { institutions?: unknown[] }).institutions || []).map((i: unknown) => ({ 
        id: (i as { id: string | number }).id, 
        nom: (i as { nom: string }).nom, 
        type: (i as { type: string }).type, 
        statut: (i as { statut?: string }).statut || 'Actif', 
        siteWeb: (i as { siteWeb?: string }).siteWeb 
      }));

  return { institutions, total: institutions.length };
}
