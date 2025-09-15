export abstract class DomainException extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class UserAlreadyExistsException extends DomainException {
  readonly code = 'USER_ALREADY_EXISTS';

  constructor(email: string) {
    super(`Un utilisateur avec l'email ${email} existe déjà`);
  }
}

export class InvalidPasswordException extends DomainException {
  readonly code = 'INVALID_PASSWORD';

  constructor(message: string) {
    super(message);
  }
}

export class ValidationException extends DomainException {
  readonly code = 'VALIDATION_ERROR';

  constructor(message: string) {
    super(message);
  }
}
