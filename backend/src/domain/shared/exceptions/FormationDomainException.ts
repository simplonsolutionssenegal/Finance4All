//domain/shared/exceptions/DomainException.ts

export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainException';
    Object.setPrototypeOf(this, DomainException.prototype);
  }
}

export class DuplicateTitleException extends DomainException {
  constructor(title: string) {
    super(`Un module avec le titre "${title}" existe déjà`);
    this.name = 'DuplicateTitleException';
    Object.setPrototypeOf(this, DuplicateTitleException.prototype);
  }
}

export class ModuleNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Le module avec l'ID "${id}" n'a pas été trouvé`);
    this.name = 'ModuleNotFoundException';
    Object.setPrototypeOf(this, ModuleNotFoundException.prototype);
  }
}

export class ValidationException extends DomainException {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationException';
    Object.setPrototypeOf(this, ValidationException.prototype);
  }
}
