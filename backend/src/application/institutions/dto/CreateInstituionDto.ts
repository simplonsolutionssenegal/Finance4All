export interface CreateInstitutionDto {
  name: string;
  description: string;
  website?: string;
  geographicZones: string[];
  logoUrl?: string;
}
