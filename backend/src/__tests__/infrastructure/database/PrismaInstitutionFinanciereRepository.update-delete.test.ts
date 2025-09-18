import { PrismaInstitutionFinanciereRepository } from '@/infrastructure/database/PrismaInstitutionFinanciereRepository';
import type { PrismaClient } from '@prisma/client';
import type { InstitutionFinanciere } from '@/domain/entities/InstitutionFinanciere';

// On se contente d’asserter l’input passé à Prisma ; on peut stub le mapper
jest.mock('@/infrastructure/database/mappers/institutionFinanciereMapper', () => ({
  toDomainInstitution: (p: any) => p,
}));

const makePrismaMock = () => {
  return {
    institutionFinanciere: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  } as unknown as PrismaClient;
};

describe('PrismaInstitutionFinanciereRepository - update & delete branches', () => {
  it('update — couvre les branches: logo défini, regionsDesservies défini, contact défini', async () => {
    const prisma = makePrismaMock();
    // on renvoie ce qu’on reçoit pour simplifier
    (prisma.institutionFinanciere.update as jest.Mock).mockImplementation(({ data }: any) =>
      Promise.resolve(data)
    );

    const repo = new PrismaInstitutionFinanciereRepository(prisma);

    const patch: Partial<InstitutionFinanciere> = {
      logo: 'data:image/png;base64,xxx',
      regionsDesservies: ['DAKAR', 'THIÈS'],
      contact: { nom: 'Bob', email: null, telephone: null },
    };

    await repo.update('id-1', patch);

    expect(prisma.institutionFinanciere.update).toHaveBeenCalledWith({
      where: { id: 'id-1' },
      data: expect.objectContaining({
        logo: 'data:image/png;base64,xxx', // L42
        regionsDesservies: ['DAKAR', 'THIÈS'], // L43
        contactNom: 'Bob', // L44-46 (branche contact défini)
        contactEmail: null,
        contactTelephone: null,
      }),
    });
  });

  it('update — couvre la branche: contact === null (remise à null en BDD)', async () => {
    const prisma = makePrismaMock();
    (prisma.institutionFinanciere.update as jest.Mock).mockResolvedValue({});

    const repo = new PrismaInstitutionFinanciereRepository(prisma);

    await repo.update('id-2', { contact: null });

    expect(prisma.institutionFinanciere.update).toHaveBeenCalledWith({
      where: { id: 'id-2' },
      data: expect.objectContaining({
        contactNom: null, // L62-64
        contactEmail: null,
        contactTelephone: null,
      }),
    });
  });

  it('delete — succès → true', async () => {
    const prisma = makePrismaMock();
    (prisma.institutionFinanciere.delete as jest.Mock).mockResolvedValue({});

    const repo = new PrismaInstitutionFinanciereRepository(prisma);
    await expect(repo.delete('id-3')).resolves.toBe(true); // L67
    expect(prisma.institutionFinanciere.delete).toHaveBeenCalledWith({ where: { id: 'id-3' } });
  });

  it('delete — exception → false', async () => {
    const prisma = makePrismaMock();
    (prisma.institutionFinanciere.delete as jest.Mock).mockRejectedValue(new Error('boom'));

    const repo = new PrismaInstitutionFinanciereRepository(prisma);
    await expect(repo.delete('id-4')).resolves.toBe(false); // L69
  });
});
