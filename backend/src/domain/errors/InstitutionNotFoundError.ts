export class InstitutionNotFoundError extends Error {
  readonly name = 'InstitutionNotFoundError';
  constructor(public readonly institutionId: string) {
    super('Institution financière non trouvée');
  }
}
