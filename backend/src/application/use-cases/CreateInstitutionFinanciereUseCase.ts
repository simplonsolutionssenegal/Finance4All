import { InstitutionFinanciere } from '@/domain/entities/InstitutionFinanciere';
import { InstitutionFinanciereRepository } from '@/domain/repositories/InstitutionFinanciereRepository';
import { InstitutionFinanciereValidator, InstitutionFinanciereInput } from '@/application/validation/InstitutionFinanciereValidator';

export class CreateInstitutionFinanciereUseCase {
  private readonly validator: InstitutionFinanciereValidator;

  constructor(private readonly institutionFinanciereRepository: InstitutionFinanciereRepository) {
    this.validator = new InstitutionFinanciereValidator();
  }

  async execute(data: InstitutionFinanciereInput): Promise<InstitutionFinanciere> {
    const validated = this.validator.validate(data);
    const institution: InstitutionFinanciere = {
      id: '',
      ...validated,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return this.institutionFinanciereRepository.create(institution);
  }

}

