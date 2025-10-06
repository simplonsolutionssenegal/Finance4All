import type { InstitutionResponseDto } from '@/application/institutions/dto/InstitutionResponseDto';
import type { Institution } from '@/domain/institutions/entities/Institution';

export class InstitutionMapper {
  static toDTO(institution: Institution): InstitutionResponseDto {
    return {
      id: institution.id.getValue(),
      name: institution.name,
      description: institution.description,
      website: institution.website.getValue(),
      geographicZones: institution.geographicZones,
      logoUrl: institution.logoUrl?.getValue(),
      status: institution.status,
      createdAt: institution.createdAt,
      updatedAt: institution.updatedAt,
    };
  }
}
