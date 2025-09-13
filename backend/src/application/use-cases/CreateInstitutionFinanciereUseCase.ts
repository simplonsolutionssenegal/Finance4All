import { InstitutionFinanciere, CreateInstitutionFinanciereData } from '@/domain/entities/InstitutionFinanciere';
import { InstitutionFinanciereRepository } from '@/domain/repositories/InstitutionFinanciereRepository';
import { InstitutionFinanciereValidator, InstitutionFinanciereInput } from '@/application/validation/InstitutionFinanciereValidator';
import { randomUUID } from 'crypto';

export class CreateInstitutionFinanciereUseCase {
  private readonly validator: InstitutionFinanciereValidator;

  constructor(private readonly institutionFinanciereRepository: InstitutionFinanciereRepository) {
    this.validator = new InstitutionFinanciereValidator();
  }

  async execute(data: InstitutionFinanciereInput): Promise<InstitutionFinanciere> {
    // Validate & normalize input (CreateInstitutionFinanciereData shape)
    const validated: CreateInstitutionFinanciereData = this.validator.validate(data);

    const now = new Date();
    const institution: InstitutionFinanciere = {
      id: randomUUID(),
      ...validated,
      createdAt: now,
      updatedAt: now,
    };
    return this.institutionFinanciereRepository.create(institution);
  }

}

