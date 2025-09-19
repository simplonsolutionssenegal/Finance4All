import type { Region, InstitutionType } from './types';

export const MAX_FILE_SIZE: number = 5_000_000; // 5MB

export enum AcceptedImageType {
  JPEG = 'image/jpeg',
  JPG = 'image/jpg',
  PNG = 'image/png',
}

export const ACCEPTED_IMAGE_TYPES: string[] = Object.values(AcceptedImageType);

// Enum pour les régions
export enum RegionValue {
  NATIONAL = 'national',
  BCEAO = 'bceao',
  DAKAR = 'dakar',
  CENTRE = 'centre',
  INTERNATIONAL = 'international',
}

// Enum pour les types d'institutions
export enum InstitutionTypeValue {
  BANQUE = 'banque',
  MICROFINANCE = 'microfinance',
  ASSURANCE = 'assurance',
  AUTRE = 'autre',
}

// Liste des régions avec labels
export const regions: Region[] = [
  { value: RegionValue.NATIONAL, label: 'Couverture sur tout le territoire national' },
  { value: RegionValue.BCEAO, label: 'Couverture zone BCEAO' },
  { value: RegionValue.DAKAR, label: 'Couverture de Dakar' },
  { value: RegionValue.CENTRE, label: 'Couverture Centre du pays' },
  { value: RegionValue.INTERNATIONAL, label: 'Couverture internationale' },
];

// Types d'institutions avec labels
export const typeInstitutions: InstitutionType[] = [
  { value: InstitutionTypeValue.BANQUE, label: 'Banque' },
  { value: InstitutionTypeValue.MICROFINANCE, label: 'Microfinance' },
  { value: InstitutionTypeValue.ASSURANCE, label: 'Assurance' },
  { value: InstitutionTypeValue.AUTRE, label: 'Autre' },
];