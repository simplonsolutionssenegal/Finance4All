import type { Request, Response, NextFunction } from 'express';
import { ServiceComparisonError } from '@/domain/institutions/errors/ServiceComparisonError';
import { TypeService } from '@/domain/institutions/entities/Service';
import type { GetServicesUseCase } from '@/domain/institutions/ports/in/GetServicesUseCase';
import type { CompareServicesUseCase } from '@/domain/institutions/ports/in/CompareServicesUseCase';
import { ServiceController } from '@/infrastructure/web/controllers/ServiceController';

describe('ServiceController', () => {
  const createMockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  let getServicesUseCase: jest.Mocked<GetServicesUseCase>;
  let compareServicesUseCase: jest.Mocked<CompareServicesUseCase>;
  let controller: ServiceController;
  let next: NextFunction;

  beforeEach(() => {
    getServicesUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetServicesUseCase>;

    compareServicesUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CompareServicesUseCase>;

    controller = new ServiceController(getServicesUseCase, compareServicesUseCase);
    next = jest.fn();
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // getAll
  // ---------------------------------------------------------------------------

  it('getAll - doit appeler le useCase avec les bons paramètres et retourner 200', async () => {
    const req = {
      query: {
        page: '2',
        limit: '25',
        type: TypeService.PAIEMENT_MARCHAND,
      },
    } as unknown as Request;

    const res = createMockResponse();

    const useCaseResult = {
      data: [{ id: 's1' }],
      pagination: {
        page: 2,
        limit: 25,
        total: 1,
        totalPages: 1,
      },
    };

    getServicesUseCase.execute.mockResolvedValueOnce(useCaseResult as any);

    await controller.getAll(req, res, next);

    expect(getServicesUseCase.execute).toHaveBeenCalledWith({
      page: 2,
      limit: 25,
      type: TypeService.PAIEMENT_MARCHAND,
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      ...useCaseResult,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('getAll - doit utiliser les valeurs par défaut et passer les erreurs à next', async () => {
    const req = {
      query: {}, // pas de page, limit, type
    } as unknown as Request;

    const res = createMockResponse();

    const error = new Error('Boom');
    getServicesUseCase.execute.mockRejectedValueOnce(error);

    await controller.getAll(req, res, next);

    // page = 1, limit = 10 par défaut
    expect(getServicesUseCase.execute).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      type: undefined,
    });

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // compare
  // ---------------------------------------------------------------------------

  it('compare - doit retourner 400 si "ids" est manquant', async () => {
    const req = {
      query: {},
    } as unknown as Request;
    const res = createMockResponse();

    await controller.compare(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Paramètre "ids" requis, ex: /services/compare?ids=ID1,ID2',
    });
    expect(compareServicesUseCase.execute).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('compare - doit retourner 400 si aucun id valide n’est fourni', async () => {
    const req = {
      query: {
        ids: ' ,  ,   ', // après trim + filter => []
      },
    } as unknown as Request;
    const res = createMockResponse();

    await controller.compare(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Aucun id valide fourni',
    });
    expect(compareServicesUseCase.execute).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('compare - doit comparer les services et retourner 200 avec le bon message', async () => {
    const req = {
      query: {
        ids: '  id1 , , id2  ',
      },
    } as unknown as Request;
    const res = createMockResponse();

    const data = [
      {
        id: 'id1',
        type: TypeService.PAIEMENT_MARCHAND,
        name: 'Service 1',
      },
      {
        id: 'id2',
        type: TypeService.PAIEMENT_MARCHAND,
        name: 'Service 2',
      },
    ];

    compareServicesUseCase.execute.mockResolvedValueOnce(data as any);

    await controller.compare(req, res, next);

    // Vérifie que les ids ont bien été trim/filter
    expect(compareServicesUseCase.execute).toHaveBeenCalledWith({
      ids: ['id1', 'id2'],
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data,
      message: `Comparaison de ${data.length} services du type "${data[0].type}"`,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('compare - doit retourner 400 si ServiceComparisonError est levée', async () => {
    const req = {
      query: {
        ids: 'id1,id2',
      },
    } as unknown as Request;
    const res = createMockResponse();

    const error = new ServiceComparisonError('Erreur de comparaison');
    compareServicesUseCase.execute.mockRejectedValueOnce(error);

    await controller.compare(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Erreur de comparaison',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('compare - doit passer les autres erreurs à next', async () => {
    const req = {
      query: {
        ids: 'id1,id2',
      },
    } as unknown as Request;
    const res = createMockResponse();

    const error = new Error('Erreur inconnue');
    compareServicesUseCase.execute.mockRejectedValueOnce(error);

    await controller.compare(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
