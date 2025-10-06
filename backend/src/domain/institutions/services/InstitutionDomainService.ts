import type { InstitutionRepository } from '@/domain/institutions/repositories/InstitutionRepository';

export class InstitutionDomainService {
  constructor(private readonly institutionRepository: InstitutionRepository) {}

  async isNameUnique(name: string): Promise<boolean> {
    const institutions = await this.institutionRepository.findByName(name);
    return institutions.length === 0;
  }
}
