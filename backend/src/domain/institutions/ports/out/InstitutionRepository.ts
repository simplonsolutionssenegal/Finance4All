import type { Institution } from '@/domain/institutions/entities/Institution';
import type { PaginationParams, PaginatedResult } from '@/domain/shared/Pagination';

export interface InstitutionRepository {
  save(institution: Institution): Promise<Institution>;
  update(institution: Institution): Promise<Institution>;
  findById(id: string): Promise<Institution | null>;
  findByName(name: string): Promise<Institution[]>;
  findAll(params: PaginationParams): Promise<PaginatedResult<Institution>>;
}
