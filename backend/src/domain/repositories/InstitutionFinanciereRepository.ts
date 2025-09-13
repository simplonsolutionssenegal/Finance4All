import { InstitutionFinanciere } from '@/domain/entities/InstitutionFinanciere';

export interface InstitutionFinanciereRepository {
  create(institution: InstitutionFinanciere): Promise<InstitutionFinanciere>;
  findById(id: string): Promise<InstitutionFinanciere | null>;
  findAll(): Promise<InstitutionFinanciere[]>;
  update(
    id: string,
    institution: Partial<InstitutionFinanciere>
  ): Promise<InstitutionFinanciere | null>;
  delete(id: string): Promise<boolean>;
}
