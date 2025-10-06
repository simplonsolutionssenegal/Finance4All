import { Container } from 'inversify';
import 'reflect-metadata';

import type { InstitutionRepository } from '@/domain/institutions/repositories/InstitutionRepository';
import { InstitutionDomainService } from '@/domain/institutions/services/InstitutionDomainService';

import { CreateInstitutionUseCase } from '@/application/institutions/use-cases/CreateInsitution.usecase';

import { InstitutionController } from '@/infrastructure/web/controllers/InstitutionController';
import type { PrismaClient } from '@prisma/client';
import { prisma } from './prismaClient';
import { PrismaInstitutionRepository } from '@/infrastructure/persistence/repositories/PrismaInstitutionRepository';

const container = new Container();

container.bind<PrismaClient>('PrismaClient').toConstantValue(prisma);

// Bind repositories
container
  .bind<InstitutionRepository>('InstitutionRepository')
  .toDynamicValue(context => {
    const prismaClient = context.get<PrismaClient>('PrismaClient');
    return new PrismaInstitutionRepository(prismaClient);
  })
  .inSingletonScope();

// Bind domain services
container
  .bind<InstitutionDomainService>('InstitutionDomainService')
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
    return new CreateInstitutionUseCase(repository, domainService);
  })
  .inSingletonScope();

// Bind controllers
container
  .bind<InstitutionController>('InstitutionController')
  .toDynamicValue(context => {
    const createUseCase = context.get<CreateInstitutionUseCase>('CreateInstitutionUseCase');

    return new InstitutionController(createUseCase);
  })
  .inSingletonScope();

export { container };
