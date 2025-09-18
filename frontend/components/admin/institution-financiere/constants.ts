import type { Region, InstitutionType } from './types';

export const MAX_FILE_SIZE: number = 5_000_000; // 5MB
export const ACCEPTED_IMAGE_TYPES: string[] = [
  'image/jpeg',
  'image/jpg',
  'image/png',
];

// Liste des régions
export const regions: Region[] = [
  { value: 'national', label: 'Couverture sur tout le territoire national' },
  { value: 'bceao', label: 'Couverture zone BCEAO' },
  { value: 'dakar', label: 'Couverture de Dakar' },
  { value: 'centre', label: 'Couverture Centre du pays' },
  { value: 'international', label: 'Couverture internationale' },
];

// Types d'institutions
export const typeInstitutions: InstitutionType[] = [
  { value: 'banque', label: 'Banque' },
  { value: 'microfinance', label: 'Microfinance' },
  { value: 'assurance', label: 'Assurance' },
  { value: 'autre', label: 'Autre' },
];