// frontend/__tests__/lib/api-services.test.ts
import { ServicesAPI } from '@/lib/API/api-product';
import type { FilterOptions } from '@/types/FilterOptions';

describe('ServicesAPI', () => {
  const OLD_ENV = process.env;

  beforeAll(() => {
    global.fetch = jest.fn();
    // Coupe les logs pour ne pas polluer la sortie de tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Force l'ENV attendu par le code
    process.env = { ...OLD_ENV, NEXT_PUBLIC_API_URL: 'http://localhost:5000' };
  });

  afterAll(() => {
    // @ts-expect-error cleanup
    global.fetch = undefined;
    process.env = OLD_ENV;
    (console.error as jest.Mock).mockRestore();
    (console.log as jest.Mock).mockRestore();
  });

  /** Helper: renvoie un vrai Response JSON (HTTP OK/KO) */
  function mockJson(ok: boolean, body: any, init?: Partial<ResponseInit>) {
    const status = init?.status ?? (ok ? 200 : 500);
    const statusText = init?.statusText ?? (ok ? 'OK' : 'Internal Server Error');
    const headers = new Headers({ 'Content-Type': 'application/json', ...(init?.headers as any) });

    (global.fetch as jest.Mock).mockResolvedValueOnce(
      new Response(JSON.stringify(body), { status, statusText, headers })
    );
  }

  /** Helper: simule une réponse HTTP non-OK dont le body n'est pas du JSON valide */
  function mockNonJsonHttpError(status = 500) {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    // statusText peut ne pas être honoré par jsdom, on n'y compte pas
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      new Response('not-json', { status, headers })
    );
  }

  it('getByInstitution — construit une URL correcte et renvoie data', async () => {
    const data = [
      { id: '1', designation: 'Crédit Immo', type: 'CREDIT', modesRemboursement: 'AGENCE' },
    ];
    mockJson(true, { status: 'success', data });

    const institutionId = 'abc-123';
    const res = await ServicesAPI.getByInstitution(institutionId);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;

    // Avec NEXT_PUBLIC_API_URL=http://localhost:5000, l’URL finale doit inclure /api/v1/
    expect(calledUrl).toBe(`http://localhost:5000/api/v1/product/by-institution/${institutionId}`);
    expect(res).toEqual(data);
  });

  it('filterByInstitution — construit correctement la query', async () => {
    mockJson(true, { status: 'success', data: [] });

    const filters: FilterOptions = {
      type: ['CREDIT', 'EPARGNE'],
      zone: ['DAKAR', 'THIES'],
      date: 'recent',
    };

    await ServicesAPI.filterByInstitution('inst-1', filters);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;

    // Chemin correct
    expect(
      calledUrl.startsWith('http://localhost:5000/api/v1/product/by-institution/inst-1/filter')
    ).toBe(true);

    // Fragments de query (l'ordre n'est pas garanti)
    expect(calledUrl).toContain('type=CREDIT');
    expect(calledUrl).toContain('type=EPARGNE');
    expect(calledUrl).toContain('zone=DAKAR');
    expect(calledUrl).toContain('zone=THIES');
    expect(calledUrl).toContain('date=recent');
  });

  it('getByInstitution — status !== success → []', async () => {
    mockJson(true, { status: 'fail', data: [] });

    const res = await ServicesAPI.getByInstitution('x');
    expect(res).toEqual([]);
  });

  it('fetchJSON — HTTP non-OK avec message JSON → lève ce message', async () => {
    mockJson(false, { message: 'Bad token' }, { status: 401, statusText: 'Unauthorized' });

    await expect(ServicesAPI.getByInstitution('y')).rejects.toThrow('Bad token');
  });

  it('fetchJSON — HTTP non-OK sans JSON valide → lève "HTTP <code> - <text>" (statusText optionnel)', async () => {
    mockNonJsonHttpError(500);

    // jsdom ne garantit pas statusText; on vérifie le début standard du message
    await expect(ServicesAPI.getByInstitution('z')).rejects.toThrow(/HTTP 500 -/);
  });
});
