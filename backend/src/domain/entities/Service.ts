import type { TypeService } from '../institutions/entities/Service';

// src/domain/entities/Service.ts
export interface Service {
  id: string;
  name: string;
  longName: string;
  type: TypeService;
  frais: Record<string, unknown>;
  conditionAccess: string[];
  plafonds: string[];
  infrastructureAccess: string[];
  institutionId: string;
  institution?: Institution;
  createdAt: Date;
  updatedAt: Date;
}

export interface Institution {
  id: string;
  name: string;
}

export interface ServiceFilter {
  type?: TypeService;
  name?: string;
  institutionId?: string;
}
