import { Container } from 'inversify';
import 'reflect-metadata';

import { InstitutionDomainService } from '@/domain/institutions/services/InstitutionDomainService';

import { InstitutionController } from '@/infrastructure/web/controllers/InstitutionController';
import type { PrismaClient } from '@prisma/client';
import { prisma } from './prismaClient';
import { PrismaInstitutionRepository } from '@/infrastructure/persistence/repositories/PrismaInstitutionRepository';
import { PrismaServiceRepository } from '@/infrastructure/persistence/repositories/PrismaServiceRepository';

import type { InstitutionRepository } from '@/domain/institutions/ports/out/InstitutionRepository';
import type { CreateInstitutionUseCase } from '@/domain/institutions/ports/in/CreateInstitutionUseCase';
import { CreateInstitutionUseCaseImpl } from '@/application/institutions/use-cases/CreateInstitutionUseCaseImpl';
import type { GetInstitutionsUseCase } from '@/domain/institutions/ports/in/GetInstitutionsUseCase';
import { GetInstitutionsUseCaseImpl } from '@/application/institutions/use-cases/GetInstitutionsUseCase';
import type { GetInstitutionByIdUseCase } from '@/domain/institutions/ports/in/GetInstitutionByIdUseCase';
import { GetInstitutionByIdUseCaseImpl } from '@/application/institutions/use-cases/GetInstitutionByIdUseCase';
import type { UpdateInstitutionUseCase } from '@/domain/institutions/ports/in/UpdateInstitutionUseCase';
import { UpdateInstitutionUseCaseImpl } from '@/application/institutions/use-cases/UpdateInstitutionUseCaseImpl';
import type { UpdateInstitutionStatusUseCase } from '@/domain/institutions/ports/in/UpdateInstitutionStatusUseCase';
import { UpdateInstitutionStatusUseCaseImpl } from '@/application/institutions/use-cases/UpdateInstitutionStatusUseCase';
import type { AddServiceUseCase } from '@/domain/institutions/ports/in/AddServiceUseCase';
import { AddServiceUseCaseImpl } from '@/application/institutions/use-cases/AddServiceUseCaseImpl';
import { ModuleController } from '../web/controllers/ModuleFormationController';

import type { GetModulesUseCase } from '@/domain/formations/ports/in/GetModulesUseCase';
import type { CreateModuleUseCase } from '@/domain/formations/ports/in/CreateModuleUseCase';
import type { ModuleRepository } from '@/domain/formations/ports/out/ModuleRepository';

import { PrismaModuleFormationRepository } from '../persistence/repositories/PrismaModuleFormationRepository';
import { CreateModuleFormationUseCaseImpl } from '@/application/formations/use-cases/CreateModuleFormationUseCaseImpl';
import { GetModulesFormationUseCaseImpl } from '@/application/formations/use-cases/GetModulesFormationUseCaseImpl';
import type { GetServicesUseCase } from '@/domain/institutions/ports/in/GetServicesUseCase';
import { GetServicesUseCaseImpl } from '@/application/institutions/use-cases/GetServicesUseCaseImpl';
import { ServiceController } from '../web/controllers/ServiceController';
import type { ServiceRepository } from '@/domain/institutions/ports/out/ServiceRepository';
import type { CompareServicesUseCase } from '@/domain/institutions/ports/in/CompareServicesUseCase';
import { CompareServicesUseCaseImpl } from '@/application/institutions/use-cases/CompareServicesUseCaseImpl';

export const TYPES = {
  CreateInstitutionUseCase: Symbol.for('CreateInstitutionUseCase'),
  UpdateInstitutionUseCase: Symbol.for('UpdateInstitutionUseCase'),
  UpdateInstitutionStatusUseCase: Symbol.for('UpdateInstitutionStatusUseCase'),
  AddServiceUseCase: Symbol.for('AddServiceUseCase'),
  GetInstitutionsUseCase: Symbol.for('GetInstitutionsUseCase'),
  GetInstitutionByIdUseCase: Symbol.for('GetInstitutionByIdUseCase'),

  GetServicesUseCase: Symbol.for('GetServicesUseCase'),

  // Ports Out (External Services)
  InstitutionRepository: Symbol.for('InstitutionRepository'),
  ServiceRepository: Symbol.for('ServiceRepository'),
  CompareServicesUseCase: Symbol.for('CompareServicesUseCase'),

  // Domain Services
  InstitutionDomainService: Symbol.for('InstitutionDomainService'),

  // Controllers
  InstitutionController: Symbol.for('InstitutionController'),

  ServiceController: Symbol.for('ServiceController'),

  // ========== Modules de formation ==========
  CreateModuleUseCase: Symbol.for('CreateModuleUseCase'),
  GetModulesUseCase: Symbol.for('GetModulesUseCase'),
  ModuleRepository: Symbol.for('ModuleRepository'),
  ModuleController: Symbol.for('ModuleController'),
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

container
  .bind<ServiceRepository>(TYPES.ServiceRepository)
  .toDynamicValue(context => {
    const prismaClient = context.get<PrismaClient>('PrismaClient');
    return new PrismaServiceRepository(prismaClient);
  })
  .inSingletonScope();
// ========== modules de formation repositories ==========
container
  .bind<ModuleRepository>(TYPES.ModuleRepository)
  .toDynamicValue(context => {
    const prismaClient = context.get<PrismaClient>('PrismaClient');
    return new PrismaModuleFormationRepository(prismaClient);
  })
  .inSingletonScope();


// Bind domain services
container
  .bind<InstitutionDomainService>(TYPES.InstitutionDomainService)
  .toDynamicValue(context => {
    const repository = context.get<InstitutionRepository>(TYPES.InstitutionRepository);
    return new InstitutionDomainService(repository);
  })
  .inSingletonScope();

// Bind use cases
container
  .bind<CreateInstitutionUseCase>(TYPES.CreateInstitutionUseCase)
  .toDynamicValue(context => {
    const repository = context.get<InstitutionRepository>(TYPES.InstitutionRepository);
    const domainService = context.get<InstitutionDomainService>(TYPES.InstitutionDomainService);
    return new CreateInstitutionUseCaseImpl(repository, domainService);
  })
  .inSingletonScope();

container
  .bind<UpdateInstitutionUseCase>(TYPES.UpdateInstitutionUseCase)
  .toDynamicValue(context => {
    const repository = context.get<InstitutionRepository>(TYPES.InstitutionRepository);
    return new UpdateInstitutionUseCaseImpl(repository);
  })
  .inSingletonScope();

container
  .bind<UpdateInstitutionStatusUseCase>(TYPES.UpdateInstitutionStatusUseCase)
  .toDynamicValue(context => {
    const repository = context.get<InstitutionRepository>(TYPES.InstitutionRepository);
    return new UpdateInstitutionStatusUseCaseImpl(repository);
  })
  .inSingletonScope();

container
  .bind<AddServiceUseCase>(TYPES.AddServiceUseCase)
  .toDynamicValue(context => {
    const repository = context.get<InstitutionRepository>(TYPES.InstitutionRepository);
    return new AddServiceUseCaseImpl(repository);
  })
  .inSingletonScope();

container
  .bind<GetInstitutionsUseCase>(TYPES.GetInstitutionsUseCase)
  .toDynamicValue(context => {
    const repository = context.get<InstitutionRepository>(TYPES.InstitutionRepository);
    return new GetInstitutionsUseCaseImpl(repository);
  })
  .inSingletonScope();

container
  .bind<GetInstitutionByIdUseCase>(TYPES.GetInstitutionByIdUseCase)
  .toDynamicValue(context => {
    const repository = context.get<InstitutionRepository>(TYPES.InstitutionRepository);
    return new GetInstitutionByIdUseCaseImpl(repository);
  })
  .inSingletonScope();

container
  .bind<GetServicesUseCase>(TYPES.GetServicesUseCase)
  .toDynamicValue(context => {
    const repository = context.get<ServiceRepository>(TYPES.ServiceRepository);
    return new GetServicesUseCaseImpl(repository);
  })
  .inSingletonScope();

container
  .bind<CompareServicesUseCase>(TYPES.CompareServicesUseCase)
  .toDynamicValue(context => {
    const repository = context.get<ServiceRepository>(TYPES.ServiceRepository);
    return new CompareServicesUseCaseImpl(repository);
  })
  .inSingletonScope();

// ========== 🆕 MODULES USE CASES ==========
container
  .bind<CreateModuleUseCase>(TYPES.CreateModuleUseCase)
  .toDynamicValue(context => {
    const moduleRepository = context.get<ModuleRepository>(TYPES.ModuleRepository);
    return new CreateModuleFormationUseCaseImpl(moduleRepository);
  })
  .inSingletonScope();

container
  .bind<GetModulesUseCase>(TYPES.GetModulesUseCase)
  .toDynamicValue(context => {
    const repository = context.get<ModuleRepository>(TYPES.ModuleRepository);
    return new GetModulesFormationUseCaseImpl(repository);
  })
  .inSingletonScope();

// Bind controllers
container
  .bind<InstitutionController>(TYPES.InstitutionController)
  .toDynamicValue(context => {
    const createUseCase = context.get<CreateInstitutionUseCase>(TYPES.CreateInstitutionUseCase);
    const updateUseCase = context.get<UpdateInstitutionUseCase>(TYPES.UpdateInstitutionUseCase);
    const addServiceUseCase = context.get<AddServiceUseCase>(TYPES.AddServiceUseCase);
    const updateStatusUseCase = context.get<UpdateInstitutionStatusUseCase>(
      TYPES.UpdateInstitutionStatusUseCase
    );
    const getInstitutionsUseCase = context.get<GetInstitutionsUseCase>(
      TYPES.GetInstitutionsUseCase
    );
    const getInstitutionByIdUseCase = context.get<GetInstitutionByIdUseCase>(
      TYPES.GetInstitutionByIdUseCase
    );

    return new InstitutionController(
      createUseCase,
      updateUseCase,
      updateStatusUseCase,
      addServiceUseCase,
      getInstitutionsUseCase,
      getInstitutionByIdUseCase
    );
  })
  .inSingletonScope();

container
  .bind<ServiceController>(TYPES.ServiceController)
  .toDynamicValue(context => {
    const getServicesUseCase = context.get<GetServicesUseCase>(TYPES.GetServicesUseCase);
    const compareServicesUseCase = context.get<CompareServicesUseCase>(
      TYPES.CompareServicesUseCase
    );
    return new ServiceController(getServicesUseCase, compareServicesUseCase);
  })
  .inSingletonScope();

// ========== modules de formation controllers ==========
container
  .bind<ModuleController>(TYPES.ModuleController)
  .toDynamicValue(context => {
    const createModuleUseCase = context.get<CreateModuleUseCase>(TYPES.CreateModuleUseCase);
    const getModulesUseCase = context.get<GetModulesUseCase>(TYPES.GetModulesUseCase);

    return new ModuleController(createModuleUseCase, getModulesUseCase);
  })
  .inSingletonScope();

export { container };
