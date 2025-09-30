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

  it('createProduct posts and returns a product', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { id: '2', designation: 'Nouveau' }, status: 'success' }),
    });
    const res = await ProductsAPI.createProduct({ designation: 'Nouveau' });
    expect(res.designation).toBe('Nouveau');
  });

  it('updateProduct puts and returns a product', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { id: '1', designation: 'Modifié' }, status: 'success' }),
    });
    const res = await ProductsAPI.updateProduct('1', { designation: 'Modifié' });
    expect(res.designation).toBe('Modifié');
  });

  it('deleteProduct calls fetch with DELETE', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'success', message: 'deleted' }),
    });
    await expect(ProductsAPI.deleteProduct('1')).resolves.toBeUndefined();
    expect((fetch as jest.Mock).mock.calls[0][1].method).toBe('DELETE');
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
