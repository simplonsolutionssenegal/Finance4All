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

import { BeneficiaryController } from '../web/controllers/BeneficiaryController';
import type { BeneficiaryRepository } from '@/domain/Beneficiary/ports/out/BeneficiaryRepository';
import { PrismaBeneficiaryRepository } from '../persistence/repositories/PrismaBeneficiaryRepository';
import type { CreateBeneficiaryUseCase } from '@/domain/Beneficiary/ports/in/CreateBeneficiaryUseCase';
import type { UpdateBeneficiaryUseCase } from '@/domain/Beneficiary/ports/in/UpdateBeneficiaryUseCase';
import { CreateBeneficiaryUseCaseImpl } from '@/application/beneficiaires/use-cases/CreateBeneficiaryUseCaseImpl';

import { UpdateBeneficiaryUseCaseImpl } from '@/application/beneficiaires/use-cases/UpdateBeneficiaryUseCaseImpl';
import type { OrganizationIdentityPort } from '@/domain/Beneficiary/ports/out/OrganizationIdentityPort';
import { ClerkOrganizationIdentityService } from '../services/ClerkOrganizationIdentityService';

// ========== Media imports ==========
import { MediaController } from '../web/controllers/MediaController';
import type { MediaRepository } from '@/domain/media/ports/out/MediaRepository';
import type { StoragePort } from '@/domain/media/ports/out/StoragePort';
import type { UploadMediaUseCase } from '@/domain/media/ports/in/UploadMediaUseCase';
import type { GetMediaByIdUseCase } from '@/domain/media/ports/in/GetMediaByIdUseCase';
import type { GetMediasUseCase } from '@/domain/media/ports/in/GetMediasUseCase';
import type { DeleteMediaUseCase } from '@/domain/media/ports/in/DeleteMediaUseCase';
import type { GetPresignedUrlUseCase } from '@/domain/media/ports/in/GetPresignedUrlUseCase';
import { PrismaMediaRepository } from '../persistence/repositories/PrismaMediaRepository';
import { MinioStorageService } from '../services/MinioStorageService';
import { UploadMediaUseCaseImpl } from '@/application/media/use-cases/UploadMediaUseCaseImpl';
import { GetMediaByIdUseCaseImpl } from '@/application/media/use-cases/GetMediaByIdUseCaseImpl';
import { GetMediasUseCaseImpl } from '@/application/media/use-cases/GetMediasUseCaseImpl';
import { DeleteMediaUseCaseImpl } from '@/application/media/use-cases/DeleteMediaUseCaseImpl';
import { GetPresignedUrlUseCaseImpl } from '@/application/media/use-cases/GetPresignedUrlUseCaseImpl';

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

  // ========== Beneficiaires ==========
  CreateBeneficiaryUseCase: Symbol.for('CreateBeneficiaryUseCase'),
  GetBeneficiariesUseCase: Symbol.for('GetBeneficiariesUseCase'),
  UpdateBeneficiaryUseCase: Symbol.for('UpdateBeneficiaryUseCase'),
  BeneficiaryRepository: Symbol.for('BeneficiaryRepository'),
  OrganizationIdentityPort: Symbol.for('OrganizationIdentityPort'),
  BeneficiaryController: Symbol.for('BeneficiaryController'),

  // ========== Media ==========
  UploadMediaUseCase: Symbol.for('UploadMediaUseCase'),
  GetMediaByIdUseCase: Symbol.for('GetMediaByIdUseCase'),
  GetMediasUseCase: Symbol.for('GetMediasUseCase'),
  DeleteMediaUseCase: Symbol.for('DeleteMediaUseCase'),
  GetPresignedUrlUseCase: Symbol.for('GetPresignedUrlUseCase'),
  MediaRepository: Symbol.for('MediaRepository'),
  StoragePort: Symbol.for('StoragePort'),
  MediaController: Symbol.for('MediaController'),
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

// ========== Beneficiaires repositories ==========
container
  .bind<BeneficiaryRepository>(TYPES.BeneficiaryRepository)
  .toDynamicValue(context => {
    const prismaClient = context.get<PrismaClient>('PrismaClient');
    return new PrismaBeneficiaryRepository(prismaClient);
  })
  .inSingletonScope();

container
  .bind<OrganizationIdentityPort>(TYPES.OrganizationIdentityPort)
  .to(ClerkOrganizationIdentityService)
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

// ========== Beneficiaires USE CASES ==========
container
  .bind<CreateBeneficiaryUseCase>(TYPES.CreateBeneficiaryUseCase)
  .toDynamicValue(context => {
    const repository = context.get<BeneficiaryRepository>(TYPES.BeneficiaryRepository);
    const orgIdentity = context.get<OrganizationIdentityPort>(TYPES.OrganizationIdentityPort);
    return new CreateBeneficiaryUseCaseImpl(repository, orgIdentity);
  })
  .inSingletonScope();

container
  .bind<UpdateBeneficiaryUseCase>(TYPES.UpdateBeneficiaryUseCase)
  .toDynamicValue(context => {
    const repository = context.get<BeneficiaryRepository>(TYPES.BeneficiaryRepository);
    return new UpdateBeneficiaryUseCaseImpl(repository);
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

// ========== Beneficiaires controllers ==========
container
  .bind<BeneficiaryController>(TYPES.BeneficiaryController)
  .toDynamicValue(context => {
    const createUC = context.get<CreateBeneficiaryUseCase>(TYPES.CreateBeneficiaryUseCase);
    const updateUC = context.get<UpdateBeneficiaryUseCase>(TYPES.UpdateBeneficiaryUseCase);
    const repo = context.get<BeneficiaryRepository>(TYPES.BeneficiaryRepository);

    return new BeneficiaryController(createUC, updateUC, repo);
  })
  .inSingletonScope();

// ========== Media repositories ==========
container
  .bind<MediaRepository>(TYPES.MediaRepository)
  .toDynamicValue(context => {
    const prismaClient = context.get<PrismaClient>('PrismaClient');
    return new PrismaMediaRepository(prismaClient);
  })
  .inSingletonScope();

// ========== Media storage port (MinIO) ==========
container
  .bind<StoragePort>(TYPES.StoragePort)
  .toDynamicValue(() => {
    return new MinioStorageService({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
      publicUrl: process.env.MINIO_PUBLIC_URL,
    });
  })
  .inSingletonScope();

// ========== Media use cases ==========
const mediaBaseUrl = process.env.MINIO_PUBLIC_URL || 'http://localhost:9000';

container
  .bind<UploadMediaUseCase>(TYPES.UploadMediaUseCase)
  .toDynamicValue(context => {
    const repository = context.get<MediaRepository>(TYPES.MediaRepository);
    const storagePort = context.get<StoragePort>(TYPES.StoragePort);
    return new UploadMediaUseCaseImpl(repository, storagePort, mediaBaseUrl);
  })
  .inSingletonScope();

container
  .bind<GetMediaByIdUseCase>(TYPES.GetMediaByIdUseCase)
  .toDynamicValue(context => {
    const repository = context.get<MediaRepository>(TYPES.MediaRepository);
    return new GetMediaByIdUseCaseImpl(repository, mediaBaseUrl);
  })
  .inSingletonScope();

container
  .bind<GetMediasUseCase>(TYPES.GetMediasUseCase)
  .toDynamicValue(context => {
    const repository = context.get<MediaRepository>(TYPES.MediaRepository);
    return new GetMediasUseCaseImpl(repository, mediaBaseUrl);
  })
  .inSingletonScope();

container
  .bind<DeleteMediaUseCase>(TYPES.DeleteMediaUseCase)
  .toDynamicValue(context => {
    const repository = context.get<MediaRepository>(TYPES.MediaRepository);
    const storagePort = context.get<StoragePort>(TYPES.StoragePort);
    return new DeleteMediaUseCaseImpl(repository, storagePort);
  })
  .inSingletonScope();

container
  .bind<GetPresignedUrlUseCase>(TYPES.GetPresignedUrlUseCase)
  .toDynamicValue(context => {
    const repository = context.get<MediaRepository>(TYPES.MediaRepository);
    const storagePort = context.get<StoragePort>(TYPES.StoragePort);
    return new GetPresignedUrlUseCaseImpl(repository, storagePort);
  })
  .inSingletonScope();

// ========== Media controllers ==========
container
  .bind<MediaController>(TYPES.MediaController)
  .toDynamicValue(context => {
    const uploadUC = context.get<UploadMediaUseCase>(TYPES.UploadMediaUseCase);
    const getByIdUC = context.get<GetMediaByIdUseCase>(TYPES.GetMediaByIdUseCase);
    const getMediasUC = context.get<GetMediasUseCase>(TYPES.GetMediasUseCase);
    const deleteUC = context.get<DeleteMediaUseCase>(TYPES.DeleteMediaUseCase);
    const presignedUrlUC = context.get<GetPresignedUrlUseCase>(TYPES.GetPresignedUrlUseCase);

    return new MediaController(uploadUC, getByIdUC, getMediasUC, deleteUC, presignedUrlUC);
  })
  .inSingletonScope();

export { container };
