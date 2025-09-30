// eslint-disable-next-line import/order
import { toast } from 'sonner';
global.fetch = jest.fn();

// Mock de 'sonner' avec factory locale pour éviter ReferenceError
jest.mock('sonner', () => {
  const mockToast = { success: jest.fn(), error: jest.fn() };
  return { toast: mockToast };
});

// eslint-disable-next-line import/order
import { act, renderHook } from '@testing-library/react';

import {
  useCreateProduct,
  useUpdateProduct,
  useRemoveProduct,
  useProductOperations,
} from '@/hooks/products/useProductOperations';
jest.mock('@/contexts/LoaderContext', () => ({
  useLoader: () => ({ showLoader: jest.fn(), hideLoader: jest.fn() }),
}));

global.fetch = jest.fn();

describe('useProductOperations hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('createProduct success', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'success', data: { id: '1' } }),
    });
    const { result } = renderHook(() => useCreateProduct());
    await act(async () => {
      const res = await result.current.createProduct({
        designation: 'Produit',
        type: 'credit',
        montantMinimum: 1000,
        montantMaximum: 5000,
        remboursement: {
          dureeMinimum: 12,
          dureeMaximum: 24,
          modalites: ['mensuel'],
          tauxInteret: 5,
          typeRemboursement: 'fixe',
          remboursementAnticipe: true,
        },
        conditionsEligibilite: {
          ageMinimum: 18,
          revenuMinimum: 2000,
          situationsProfessionnelles: ['CDI'],
          documentsRequis: ['Pièce identité'],
          autresConditions: [],
        },
      });
      expect(res.success).toBe(true);
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it('updateProduct success', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'success', data: { id: '1' } }),
    });
    const { result } = renderHook(() => useUpdateProduct());
    await act(async () => {
      const res = await result.current.updateProduct('1', { designation: 'Produit' });
      expect(res.success).toBe(true);
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it('removeProduct success', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'success' }),
    });
    const { result } = renderHook(() => useRemoveProduct());
    await act(async () => {
      const res = await result.current.removeProduct('1');
      expect(res.success).toBe(true);
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it('useProductOperations exposes all methods', () => {
    const { result } = renderHook(() => useProductOperations());
    expect(result.current).toHaveProperty('createProduct');
    expect(result.current).toHaveProperty('updateProduct');
    expect(result.current).toHaveProperty('removeProduct');
  });
});
