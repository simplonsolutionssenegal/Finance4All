// src/domain/errors/InstitutionNotFoundError.ts
export class InstitutionNotFoundError extends Error {
  readonly code = 'INSTITUTION_NOT_FOUND' as const; // utilisé par le controller
  readonly status = 404 as const;

  constructor(institutionId: string) {
    super(`Institution not found: ${institutionId}`);
    this.name = 'InstitutionNotFoundError';
  }
}
