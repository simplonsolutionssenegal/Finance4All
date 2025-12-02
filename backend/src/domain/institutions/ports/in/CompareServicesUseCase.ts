// domain/institutions/ports/in/CompareServicesUseCase.ts
import type { UseCase } from '@/domain/shared/UseCase';
import type { ComparedServiceDTO } from '@/domain/institutions/value-objects/ComparedServiceDTO';

export interface CompareServicesQuery {
  ids: string[];
}

export interface CompareServicesUseCase
  extends UseCase<CompareServicesQuery, ComparedServiceDTO[]> {}
