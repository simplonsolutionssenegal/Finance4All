import {
  DomainException,
  DuplicateTitleException,
  ModuleNotFoundException,
  ValidationException,
} from '../../../../src/domain/shared/exceptions/FormationDomainException';

describe('DomainException hierarchy et messages', () => {
  test('DomainException doit étendre Error et conserver le message', () => {
    const err = new DomainException('erreur générale');

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(DomainException);
    expect(err.name).toBe('DomainException');
    expect(err.message).toBe('erreur générale');
    expect(typeof err.stack).toBe('string');
  });

  test('DuplicateTitleException contient le titre dans le message et hérite correctement', () => {
    const title = 'Mon titre';
    const err = new DuplicateTitleException(title);

    expect(err).toBeInstanceOf(DuplicateTitleException);
    expect(err).toBeInstanceOf(DomainException);
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('DuplicateTitleException');
    expect(err.message).toContain(title);
    // message should follow the pattern used in implementation
    expect(err.message).toBe(`Un module avec le titre "${title}" existe déjà`);
  });

  test("ModuleNotFoundException inclut l'ID et a le bon nom", () => {
    const id = '123-abc';
    const err = new ModuleNotFoundException(id);

    expect(err).toBeInstanceOf(ModuleNotFoundException);
    expect(err).toBeInstanceOf(DomainException);
    expect(err.name).toBe('ModuleNotFoundException');
    expect(err.message).toBe(`Le module avec l'ID "${id}" n'a pas été trouvé`);
  });

  test('ValidationException a le nom et transmet le message', () => {
    const msg = 'valeur invalide';
    const err = new ValidationException(msg);

    expect(err).toBeInstanceOf(ValidationException);
    expect(err).toBeInstanceOf(DomainException);
    expect(err.name).toBe('ValidationException');
    expect(err.message).toBe(msg);
  });

  test('les prototypes sont correctement configurés (instanceof fonctionne après setPrototypeOf)', () => {
    // Implémentation utilise Object.setPrototypeOf; vérifier instanceof justement
    const d = new DuplicateTitleException('t');
    const v = new ValidationException('v');

    expect(Object.getPrototypeOf(d)).toBe(DuplicateTitleException.prototype);
    expect(Object.getPrototypeOf(v)).toBe(ValidationException.prototype);
  });
});
