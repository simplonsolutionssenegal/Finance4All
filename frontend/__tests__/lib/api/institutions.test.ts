import '@testing-library/jest-dom';
import { fetchInstitutions, createInstitution } from '@/lib/api/institutions';

// Mock de fetch
global.fetch = jest.fn();

describe('API institutions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchInstitutions', () => {
    it('should fetch institutions successfully', async () => {
      const mockData = {
        success: true,
        data: [
          {
            id: '1',
            nom: 'Test Institution',
            type: 'Banque',
            statut: 'Actif',
            siteWeb: 'https://test.com',
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await fetchInstitutions();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1/institutions',
        { cache: 'no-store' }
      );
      expect(result.institutions).toHaveLength(1);
      expect(result.institutions[0].nom).toBe('Test Institution');
    });

    it('should handle institutions in legacy format', async () => {
      const mockData = {
        institutions: [
          {
            id: '1',
            nom: 'Legacy Institution',
            type: 'Banque',
            statut: 'Actif',
            siteWeb: 'https://legacy.com',
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await fetchInstitutions();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1/institutions',
        { cache: 'no-store' }
      );
      expect(result.institutions).toHaveLength(1);
      expect(result.institutions[0].nom).toBe('Legacy Institution');
    });

    it('should handle fetch error', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      await expect(fetchInstitutions()).rejects.toThrow(
        'Erreur lors de la récupération des institutions'
      );
    });
  });

  describe('createInstitution', () => {
    it('should create institution successfully', async () => {
      const mockResponse = {
        id: '1',
        nom: 'New Institution',
        type: 'Banque',
        description: 'Test description',
        siteWeb: 'https://test.com',
        statut: 'Actif',
        createdAt: '2025-09-16T12:00:00Z',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const formValues = {
        nom: 'New Institution',
        type: 'Banque',
        description: 'Test description',
        siteWeb: 'https://test.com',
        contactNom: '',
        contactEmail: '',
        contactTelephone: '',
        regionsDesservies: ['region1'],
        logo: null,
      };

      const result = await createInstitution(formValues);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1/institutions',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('New Institution'),
        })
      );
      expect(result.nom).toBe('New Institution');
    });

    it('should handle creation without logo', async () => {
      const mockResponse = {
        id: '1',
        nom: 'Institution without Logo',
        type: 'Banque',
        description: 'Test description',
        siteWeb: 'https://test.com',
        statut: 'Actif',
        createdAt: '2025-09-16T12:00:00Z',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const formValues = {
        nom: 'Institution without Logo',
        type: 'Banque',
        description: 'Test description',
        siteWeb: 'https://test.com',
        contactNom: '',
        contactEmail: '',
        contactTelephone: '',
        regionsDesservies: ['region1'],
        logo: null,
      };

      const result = await createInstitution(formValues);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1/institutions',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('"logo":null'),
        })
      );
      expect(result.nom).toBe('Institution without Logo');
    });

    it('should handle create error', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Validation error' }),
      });

      const formValues = {
        nom: '',
        type: 'Banque',
        description: 'Test description',
        siteWeb: 'https://test.com',
        contactNom: '',
        contactEmail: '',
        contactTelephone: '',
        regionsDesservies: ['region1'],
        logo: null,
      };

      await expect(createInstitution(formValues)).rejects.toThrow(
        'Validation error'
      );
    });
  });

  it('should fallback to generic error if error body is not JSON (covers 44–48 catch/fallback)', async () => {
  (fetch as jest.Mock).mockResolvedValueOnce({
    ok: false,
    json: async () => { throw new Error('invalid json'); }, // force le catch
  });

  const formValues = {
    nom: 'X',
    type: 'Banque',
    description: 'Desc',
    siteWeb: 'https://test.com',
    contactNom: '',
    contactEmail: '',
    contactTelephone: '',
    regionsDesservies: ['region1'],
    logo: null,
  };

  await expect(createInstitution(formValues)).rejects.toThrow(
    'Erreur lors de la création de linstitution'
  );
})
});