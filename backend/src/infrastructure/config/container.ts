import { Container } from 'inversify';
import 'reflect-metadata';

import { InstitutionDomainService } from '@/domain/institutions/services/InstitutionDomainService';

import { InstitutionController } from '@/infrastructure/web/controllers/InstitutionController';
import type { PrismaClient } from '@prisma/client';
import { prisma } from './prismaClient';
import { PrismaInstitutionRepository } from '@/infrastructure/persistence/repositories/PrismaInstitutionRepository';
import type { InstitutionRepository } from '@/domain/institutions/ports/out/InstitutionRepository';
import type { CreateInstitutionUseCase } from '@/domain/institutions/ports/in/CreateInstitutionUseCase';
import { CreateInstitutionUseCaseImpl } from '@/application/institutions/use-cases/CreateInsitution.usecase';

export const TYPES = {
  CreateInstitutionUseCase: Symbol.for('CreateInstitutionUseCase'),

  // Ports Out (External Services)
  InstitutionRepository: Symbol.for('InstitutionRepository'),

  // Domain Services
  InstitutionDomainService: Symbol.for('InstitutionDomainService'),

  // Controllers
  InstitutionController: Symbol.for('InstitutionController'),
};

const container = new Container();

container.bind<PrismaClient>('PrismaClient').toConstantValue(prisma);

// Bind repositories
container
  .bind<InstitutionRepository>(TYPES.InstitutionRepository)
  .toDynamicValue(context => {
    const prismaClient = context.get<PrismaClient>('PrismaClient');
    return new PrismaInstitutionRepository(prismaClient);
  })
  .inSingletonScope();

// Bind domain services
container
  .bind<InstitutionDomainService>(TYPES.InstitutionDomainService)
  .toDynamicValue(context => {
    const repository = context.get<InstitutionRepository>('InstitutionRepository');
    return new InstitutionDomainService(repository);
  })
  .inSingletonScope();

// Bind use cases
container
  .bind<CreateInstitutionUseCase>('CreateInstitutionUseCase')
  .toDynamicValue(context => {
    const repository = context.get<InstitutionRepository>('InstitutionRepository');
    const domainService = context.get<InstitutionDomainService>('InstitutionDomainService');
    return new CreateInstitutionUseCaseImpl(repository, domainService);
  })
  .inSingletonScope();

// Bind controllers
container
  .bind<InstitutionController>('InstitutionController')
  .toDynamicValue(context => {
    const createUseCase = context.get<CreateInstitutionUseCase>(TYPES.CreateInstitutionUseCase);

    return new InstitutionController(createUseCase);
  })
  .inSingletonScope();

export { container };
