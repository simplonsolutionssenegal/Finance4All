import { ProductsAPI } from '@/lib/api/products';

global.fetch = jest.fn();

describe('ProductsAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getAllProducts returns products', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [{ id: '1', designation: 'Produit' }], status: 'success' }),
    });
    const res = await ProductsAPI.getAllProducts(1, 10);
    expect(res.data[0].designation).toBe('Produit');
  });

  it('getProductById returns a product', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { id: '1', designation: 'Produit' }, status: 'success' }),
    });
    const res = await ProductsAPI.getProductById('1');
    expect(res.designation).toBe('Produit');
  });

  it('getProductsByType returns filtered products', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [{ id: '1', type: 'credit' }], status: 'success' }),
    });
    const res = await ProductsAPI.getProductsByType('credit');
    expect(res[0].type).toBe('credit');
  });

  it('searchProducts returns products', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [{ id: '1', designation: 'Produit' }], status: 'success' }),
    });
    const res = await ProductsAPI.searchProducts('Produit');
    expect(res[0].designation).toBe('Produit');
  });

  it('throws on API error', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Erreur serveur' }),
    });
    await expect(ProductsAPI.getAllProducts()).rejects.toThrow('Erreur serveur');
  });
});
