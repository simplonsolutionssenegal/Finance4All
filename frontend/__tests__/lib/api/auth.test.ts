import { registerUser } from '@/lib/api/auth';

describe('lib/api/auth registerUser', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch as unknown as typeof fetch;
  });

  it('envoie la requête et retourne les données en cas de succès', async () => {
    const mockResponse = {
      success: true,
      data: { id: 1, email: 'john@example.com' },
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 201,
      statusText: 'Created',
      headers: new Map(),
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    });

    const result = await registerUser({
      clerkId: 'user_1',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/v1\/users\/register$/),
      expect.objectContaining({ method: 'POST' })
    );
    expect(result).toEqual(mockResponse);
  });

  it('lève une erreur avec le message backend quand ok=false et réponse JSON valide', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      headers: new Map(),
      text: () => Promise.resolve(JSON.stringify({ error: { message: 'Invalid payload' } })),
    });

    await expect(
      registerUser({ clerkId: 'x', email: 'a@b.c', firstName: 'A', lastName: 'B' })
    ).rejects.toThrow('Invalid payload');
  });

  it("lève une erreur générique quand la réponse n'est pas du JSON parsable", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Server Error',
      headers: new Map(),
      text: () => Promise.resolve('<html>not json</html>'),
    });

    await expect(
      registerUser({ clerkId: 'y', email: 'c@d.e', firstName: 'C', lastName: 'D' })
    ).rejects.toThrow('Invalid JSON response from server');
  });

  it('retourne un objet vide quand la réponse ok=true est vide', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Map(),
      text: () => Promise.resolve(''),
    });

    const result = await registerUser({
      clerkId: 'user_2',
      email: 'empty@example.com',
      firstName: 'Empty',
      lastName: 'Body',
    });

    expect(result).toEqual({});
  });

  it('propage les erreurs réseau quand fetch rejette', async () => {
    const networkError = new Error('Network down');
    global.fetch = jest.fn().mockRejectedValue(networkError);

    await expect(
      registerUser({ clerkId: 'user_3', email: 'n@e.t', firstName: 'Net', lastName: 'Error' })
    ).rejects.toThrow('Network down');
  });
});
