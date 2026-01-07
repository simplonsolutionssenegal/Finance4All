import { z } from 'zod';

export const institutionSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  website: z.string().url('Doit être une URL valide').optional().or(z.literal('')),
  geographicZones: z.array(z.string()).min(1, 'Au moins une zone géographique est requise'),
  logoUrl: z.string().url('Doit être une URL valide').optional().or(z.literal('')),
  type: z.enum(
    [
      'ETABLISSEMENT_MONNAIE_ELECTRONIQUE',
      'PORTEFEUILLE_NUMERIQUE',
      'SERVICE_PAIEMENT_ELECTRONIQUE',
      'BANQUE_NUMERIQUE',
      'SERVICE_FINANCIER_DECENTRALISE',
      'SERVICE_FINANCEMENT_PARTICIPATIF',
      'SERVICE_INVESTISSEMENT',
      'SERVICE_GESTION_FINANCIERE',
      'SERVICE_ASSURANCE_NUMERIQUE',
    ],
    'Le type est requis'
  ),
  pays: z.enum(['SENEGAL', 'CAMEROUN'], 'Le pays est requis'),
});

export type InstitutionFormData = z.infer<typeof institutionSchema>;

export const AVAILABLE_ZONES = [
  'EURO',
  'USD',
  'Franc Suisse',
  'Roupie indienne',
  'Australie',
  'Caraïbes orientales',
  'Sud Africain',
  'UEMOA',
  'CEMAC',
  'Pacifique',
];

export const INSTITUTION_TYPES = {
  ETABLISSEMENT_MONNAIE_ELECTRONIQUE: 'Établissement de monnaie électronique',
  PORTEFEUILLE_NUMERIQUE: 'Portefeuille numérique',
  SERVICE_PAIEMENT_ELECTRONIQUE: 'Service de paiement',
  BANQUE_NUMERIQUE: 'Banque numérique',
  SERVICE_FINANCIER_DECENTRALISE: 'SFD',
  SERVICE_FINANCEMENT_PARTICIPATIF: 'Financement participatif',
  SERVICE_INVESTISSEMENT: 'Investissement',
  SERVICE_GESTION_FINANCIERE: 'Gestion financière',
  SERVICE_ASSURANCE_NUMERIQUE: 'Assurance numérique',
} as const;

export const COUNTRIES = {
  SENEGAL: 'Sénégal',
  CAMEROUN: 'Cameroun',
} as const;

export const COUNTRY_FLAGS = {
  SENEGAL: '🇸🇳',
  CAMEROUN: '🇨🇲',
} as const;

export const removeZone = (zones: string[] | undefined, zoneToRemove: string): string[] => {
  return zones?.filter(z => z !== zoneToRemove) || [];
};
