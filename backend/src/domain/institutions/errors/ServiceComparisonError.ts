// domain/institutions/errors/ServiceComparisonError.ts
export class ServiceComparisonError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ServiceComparisonError';
  }
}
