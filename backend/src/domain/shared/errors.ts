export class DuplicateError extends Error {
  constructor(name: string, entity: string) {
    super(`Entity ${entity} with name ${name} already exists`);
    this.name = 'DuplicateError';
  }
}

export class NotFoundError extends Error {
  constructor(id: string, entity: string) {
    super(`Entity ${entity} with id ${id} not found`);
    this.name = 'NotFoundError';
  }
}

export class InvalidError extends Error {
  constructor(message: string, entity: string) {
    super(`Invalid entitiy ${entity}: ${message}`);
    this.name = 'InvalidError';
  }
}
