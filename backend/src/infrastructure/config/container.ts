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
import type { GetInstitutionsUseCase } from '@/domain/institutions/ports/in/GetInstitutionsUseCase';
import { GetInstitutionsUseCaseImpl } from '@/application/institutions/use-cases/GetInstitutionsUseCase';
import type { GetInstitutionByIdUseCase } from '@/domain/institutions/ports/in/GetInstitutionByIdUseCase';
import { GetInstitutionByIdUseCaseImpl } from '@/application/institutions/use-cases/GetInstitutionByIdUseCase';
import type { UpdateInstitutionUseCase } from '@/domain/institutions/ports/in/UpdateInstitutionUseCase';
import { UpdateInstitutionUseCaseImpl } from '@/application/institutions/use-cases/UpdateInstitutionUseCase';
import type { UpdateInstitutionStatusUseCase } from '@/domain/institutions/ports/in/UpdateInstitutionStatusUseCase';
import { UpdateInstitutionStatusUseCaseImpl } from '@/application/institutions/use-cases/UpdateInstitutionStatusUseCase';
import type { AddServiceUseCase } from '@/domain/institutions/ports/in/AddServiceUseCase';
import { AddServiceUseCaseImpl } from '@/application/institutions/use-cases/AddServiceUseCaseImpl';

// Beneficiary imports
import { BeneficiaryController } from '@/infrastructure/web/controllers/BeneficiaryController';
import { PrismaUserRepository } from '@/infrastructure/persistence/repositories/PrismaUserRepository';
import type { UserRepository } from '@/domain/repositories/UserRepository';
import type { CreateBeneficiaryUseCase } from '@/application/use-cases/CreateBeneficiaryUseCase';
import { CreateBeneficiaryCaseImpl } from '@/domain/use-cases/createBeneficiaryCaseImpl';

export const TYPES = {
  CreateInstitutionUseCase: Symbol.for('CreateInstitutionUseCase'),
  UpdateInstitutionUseCase: Symbol.for('UpdateInstitutionUseCase'),
  UpdateInstitutionStatusUseCase: Symbol.for('UpdateInstitutionStatusUseCase'),
  AddServiceUseCase: Symbol.for('AddServiceUseCase'),
  GetInstitutionsUseCase: Symbol.for('GetInstitutionsUseCase'),
  GetInstitutionByIdUseCase: Symbol.for('GetInstitutionByIdUseCase'),

  // Ports Out (External Services)
  InstitutionRepository: Symbol.for('InstitutionRepository'),

  // Domain Services
  InstitutionDomainService: Symbol.for('InstitutionDomainService'),

  // Controllers
  InstitutionController: Symbol.for('InstitutionController'),

  // Beneficiary
  CreateBeneficiaryUseCase: Symbol.for('CreateBeneficiaryUseCase'),
  UserRepository: Symbol.for('UserRepository'),
  BeneficiaryController: Symbol.for('BeneficiaryController'),
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

// Bind User Repository
container
  .bind<UserRepository>(TYPES.UserRepository)
  .toDynamicValue(context => {
    const prismaClient = context.get<PrismaClient>('PrismaClient');
    return new PrismaUserRepository(prismaClient);
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

// Bind Beneficiary Use Case
container
  .bind<CreateBeneficiaryUseCase>(TYPES.CreateBeneficiaryUseCase)
  .toDynamicValue(context => {
    const repository = context.get<UserRepository>(TYPES.UserRepository);
    return new CreateBeneficiaryCaseImpl(repository);
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

// Bind Beneficiary Controller
container
  .bind<BeneficiaryController>(TYPES.BeneficiaryController)
  .toDynamicValue(context => {
    const createBeneficiaryUseCase = context.get<CreateBeneficiaryUseCase>(
      TYPES.CreateBeneficiaryUseCase
    );
    return new BeneficiaryController(createBeneficiaryUseCase);
  })
  .inSingletonScope();

export { container };
