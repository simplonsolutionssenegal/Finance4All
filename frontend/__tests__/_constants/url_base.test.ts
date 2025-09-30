// __tests__/constants.spec.ts

import { _BASE_URL } from '@/_constantes/url_base';

describe('_BASE_URL', () => {
  it('doit être la bonne URL de base locale', () => {
    expect(_BASE_URL).toBe('http://localhost:5000/api/v1');
  });

  it("doit pouvoir construire l'endpoint service/by-institution/1", () => {
    const endpoint = `${_BASE_URL}/service/by-institution/1`;
    expect(endpoint).toBe('http://localhost:5000/api/v1/service/by-institution/1');
  });
});
