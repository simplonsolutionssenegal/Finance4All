import type { Institution } from '@/domain/institutions/entities/Institution';

export interface InstitutionRepository {
  save(institution: Institution): Promise<Institution>;
  findByName(name: string): Promise<Institution[]>;
}
