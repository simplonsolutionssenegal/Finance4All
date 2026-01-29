import type { AddQuizUseCase } from '@/domain/formations/ports/in/AddQuizUseCase';
import { Container } from 'inversify';
import 'reflect-metadata';

import { InstitutionDomainService } from '@/domain/institutions/services/InstitutionDomainService';

import { InstitutionController } from '@/infrastructure/web/controllers/InstitutionController';
import type { PrismaClient } from '@prisma/client';
import { prisma } from './prismaClient';
import { PrismaInstitutionRepository } from '@/infrastructure/persistence/repositories/PrismaInstitutionRepository';
import { PrismaServiceRepository } from '@/infrastructure/persistence/repositories/PrismaServiceRepository';
import { PrismaQuizRepository } from '@/infrastructure/persistence/repositories/PrismaQuizRepository';

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
import { ModuleController } from '@/infrastructure/web/controllers/ModuleFormationController';

import type { GetModulesUseCase } from '@/domain/formations/ports/in/GetModulesUseCase';
import type { CreateModuleUseCase } from '@/domain/formations/ports/in/CreateModuleUseCase';
import type { ModuleRepository } from '@/domain/formations/ports/out/ModuleRepository';

import { PrismaModuleFormationRepository } from '@/infrastructure/persistence/repositories/PrismaModuleFormationRepository';
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
import { PrismaBeneficiaryRepository } from '@/infrastructure/persistence/repositories/PrismaBeneficiaryRepository';
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
import type { UploadTemporaryMediaUseCase } from '@/domain/media/ports/in/UploadTemporaryMediaUseCase';
import type { CleanupExpiredMediaUseCase } from '@/domain/media/ports/in/CleanupExpiredMediaUseCase';
import { PrismaMediaRepository } from '../persistence/repositories/PrismaMediaRepository';
import { MinioStorageService } from '../services/MinioStorageService';
import { UploadMediaUseCaseImpl } from '@/application/media/use-cases/UploadMediaUseCaseImpl';
import { GetMediaByIdUseCaseImpl } from '@/application/media/use-cases/GetMediaByIdUseCaseImpl';
import { GetMediasUseCaseImpl } from '@/application/media/use-cases/GetMediasUseCaseImpl';
import { DeleteMediaUseCaseImpl } from '@/application/media/use-cases/DeleteMediaUseCaseImpl';
import { GetPresignedUrlUseCaseImpl } from '@/application/media/use-cases/GetPresignedUrlUseCaseImpl';
import { UploadTemporaryMediaUseCaseImpl } from '@/application/media/use-cases/UploadTemporaryMediaUseCaseImpl';
import { CleanupExpiredMediaUseCaseImpl } from '@/application/media/use-cases/CleanupExpiredMediaUseCaseImpl';
import { MediaCleanupCronService } from '../services/MediaCleanupCronService';

// ========== Streaming imports ==========
import type { HlsVariantRepository } from '@/domain/streaming/ports/out/HlsVariantRepository';
import type { TranscodingJobRepository } from '@/domain/streaming/ports/out/TranscodingJobRepository';
import type { MediaProgressRepository } from '@/domain/streaming/ports/out/MediaProgressRepository';
import type { StreamTokenRepository } from '@/domain/streaming/ports/out/StreamTokenRepository';
import type { TranscodingServicePort } from '@/domain/streaming/ports/out/TranscodingServicePort';
import type { JobQueuePort } from '@/domain/streaming/ports/out/JobQueuePort';
import type { StartTranscodingUseCase } from '@/domain/streaming/ports/in/StartTranscodingUseCase';
import type { GetTranscodingStatusUseCase } from '@/domain/streaming/ports/in/GetTranscodingStatusUseCase';
import type { GetStreamManifestUseCase } from '@/domain/streaming/ports/in/GetStreamManifestUseCase';
import type { UpdateProgressUseCase } from '@/domain/streaming/ports/in/UpdateProgressUseCase';
import type { GetProgressUseCase } from '@/domain/streaming/ports/in/GetProgressUseCase';
import type { GenerateStreamTokenUseCase } from '@/domain/streaming/ports/in/GenerateStreamTokenUseCase';
import { PrismaHlsVariantRepository } from '../persistence/repositories/PrismaHlsVariantRepository';
import { PrismaTranscodingJobRepository } from '../persistence/repositories/PrismaTranscodingJobRepository';
import { PrismaMediaProgressRepository } from '../persistence/repositories/PrismaMediaProgressRepository';
import { PrismaStreamTokenRepository } from '../persistence/repositories/PrismaStreamTokenRepository';
import { FFmpegTranscodingService } from '../services/FFmpegTranscodingService';
import { BullMQJobQueue } from '../services/BullMQJobQueue';
import { StartTranscodingUseCaseImpl } from '@/application/streaming/use-cases/StartTranscodingUseCaseImpl';
import { GetTranscodingStatusUseCaseImpl } from '@/application/streaming/use-cases/GetTranscodingStatusUseCaseImpl';
import { GetStreamManifestUseCaseImpl } from '@/application/streaming/use-cases/GetStreamManifestUseCaseImpl';
import { UpdateProgressUseCaseImpl } from '@/application/streaming/use-cases/UpdateProgressUseCaseImpl';
import { GetProgressUseCaseImpl } from '@/application/streaming/use-cases/GetProgressUseCaseImpl';
import { GenerateStreamTokenUseCaseImpl } from '@/application/streaming/use-cases/GenerateStreamTokenUseCaseImpl';
import { StreamingController } from '../web/controllers/StreamingController';
import { TranscodingWorker } from '../workers/TranscodingWorker';
import type { GetModuleByIdUseCase } from '@/domain/formations/ports/in/GetModuleByIdUseCase';
import { GetModuleByIdUseCaseImpl } from '@/application/formations/use-cases/GetModuleByIdUseCaseImpl';
import type { AddLessonUseCase } from '@/domain/formations/ports/in/AddLessonUseCase';
import { AddLessonUseCaseImpl } from '@/application/formations/use-cases/AddLessonUseCaseImpl';
import { AddQuizUseCaseImpl } from '@/application/formations/use-cases/AddQuizUseCaseImpl';
import type { QuizRepository } from '@/domain/formations/ports/out/QuizRepository';
import { GetQuizByIdUseCaseImpl } from '@/application/formations/use-cases/GetQuizByIdUseCaseImpl';
import { QuizController } from '@/infrastructure/web/controllers/QuizController';
import type { LessonRepository } from '@/domain/formations/ports/out/LessonRepository';
import { PrismaLessonRepository } from '@/infrastructure/persistence/repositories/PrismaLessonRepository';
import type { GetQuizByIdUseCase } from '@/domain/formations/ports/in/GetQuizByIdUseCase';
import type { GetLessonByIdUseCase } from '@/domain/formations/ports/in/GetLessonByIdUseCase';
import { GetLessonByIdUseCaseImpl } from '@/application/formations/use-cases/GetLessonByIdUseCaseImpl';
import { LessonController } from '../web/controllers/LessonController';

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
  QuizRepository: Symbol.for('QuizRepository'),
  LessonRepository: Symbol.for('LessonRepository'),
  CompareServicesUseCase: Symbol.for('CompareServicesUseCase'),

  // Domain Services
  InstitutionDomainService: Symbol.for('InstitutionDomainService'),

  // Controllers
  InstitutionController: Symbol.for('InstitutionController'),
  QuizController: Symbol.for('QuizController'),
  LessonController: Symbol.for('LessonController'),
  ServiceController: Symbol.for('ServiceController'),

  // ========== Modules de formation ==========
  CreateModuleUseCase: Symbol.for('CreateModuleUseCase'),
  GetModulesUseCase: Symbol.for('GetModulesUseCase'),
  GetModuleByIdUseCase: Symbol.for('GetModuleByIdUseCase'),
  AddLessonUseCase: Symbol.for('AddLessonUseCase'),
  AddQuizUseCase: Symbol.for('AddQuizUseCase'),
  ModuleRepository: Symbol.for('ModuleRepository'),
  ModuleController: Symbol.for('ModuleController'),

  // ========== Quiz ==========
  GetQuizByIdUseCase: Symbol.for('GetQuizByIdUseCase'),
  // ========== Lesson ==========
  GetLessonByIdUseCase: Symbol.for('GetLessonByIdUseCase'),

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
  UploadTemporaryMediaUseCase: Symbol.for('UploadTemporaryMediaUseCase'),
  CleanupExpiredMediaUseCase: Symbol.for('CleanupExpiredMediaUseCase'),
  MediaRepository: Symbol.for('MediaRepository'),
  StoragePort: Symbol.for('StoragePort'),
  MediaController: Symbol.for('MediaController'),
  MediaCleanupCronService: Symbol.for('MediaCleanupCronService'),

  // ========== Streaming ==========
  HlsVariantRepository: Symbol.for('HlsVariantRepository'),
  TranscodingJobRepository: Symbol.for('TranscodingJobRepository'),
  MediaProgressRepository: Symbol.for('MediaProgressRepository'),
  StreamTokenRepository: Symbol.for('StreamTokenRepository'),
  TranscodingServicePort: Symbol.for('TranscodingServicePort'),
  JobQueuePort: Symbol.for('JobQueuePort'),
  StartTranscodingUseCase: Symbol.for('StartTranscodingUseCase'),
  GetTranscodingStatusUseCase: Symbol.for('GetTranscodingStatusUseCase'),
  GetStreamManifestUseCase: Symbol.for('GetStreamManifestUseCase'),
  UpdateProgressUseCase: Symbol.for('UpdateProgressUseCase'),
  GetProgressUseCase: Symbol.for('GetProgressUseCase'),
  GenerateStreamTokenUseCase: Symbol.for('GenerateStreamTokenUseCase'),
  StreamingController: Symbol.for('StreamingController'),
  TranscodingWorker: Symbol.for('TranscodingWorker'),
  BullMQJobQueue: Symbol.for('BullMQJobQueue'),
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

// ========== Quiz ==========

container
  .bind<QuizRepository>(TYPES.QuizRepository)
  .toDynamicValue(context => {
    const prismaClient = context.get<PrismaClient>('PrismaClient');
    return new PrismaQuizRepository(prismaClient);
  })
  .inSingletonScope();

// ========= Lesson ==========
container
  .bind<LessonRepository>(TYPES.LessonRepository)
  .toDynamicValue(context => {
    const prismaClient = context.get<PrismaClient>('PrismaClient');
    return new PrismaLessonRepository(prismaClient);
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

container
  .bind<GetModuleByIdUseCase>(TYPES.GetModuleByIdUseCase)
  .toDynamicValue(context => {
    const repository = context.get<ModuleRepository>(TYPES.ModuleRepository);
    return new GetModuleByIdUseCaseImpl(repository);
  })
  .inSingletonScope();

container
  .bind<AddLessonUseCase>(TYPES.AddLessonUseCase)
  .toDynamicValue(context => {
    const moduleRepository = context.get<ModuleRepository>(TYPES.ModuleRepository);
    return new AddLessonUseCaseImpl(moduleRepository);
  })
  .inSingletonScope();

container
  .bind<AddQuizUseCase>(TYPES.AddQuizUseCase)
  .toDynamicValue(context => {
    const moduleRepository = context.get<ModuleRepository>(TYPES.ModuleRepository);
    return new AddQuizUseCaseImpl(moduleRepository);
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

// ======Quiz Use Cases ======
container
  .bind<GetQuizByIdUseCase>(TYPES.GetQuizByIdUseCase)
  .toDynamicValue(context => {
    const repository = context.get<QuizRepository>(TYPES.QuizRepository);
    return new GetQuizByIdUseCaseImpl(repository);
  })
  .inSingletonScope();

// ====== Lesson Use Cases ======
container
  .bind<GetLessonByIdUseCase>(TYPES.GetLessonByIdUseCase)
  .toDynamicValue(context => {
    const repository = context.get<LessonRepository>(TYPES.LessonRepository);
    return new GetLessonByIdUseCaseImpl(repository);
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
    const getModuleByIdUseCase = context.get<GetModuleByIdUseCase>(TYPES.GetModuleByIdUseCase);
    const addLessonUseCase = context.get<AddLessonUseCase>(TYPES.AddLessonUseCase);
    const addQuizUseCase = context.get<AddQuizUseCase>(TYPES.AddQuizUseCase);

    return new ModuleController(
      createModuleUseCase,
      getModulesUseCase,
      getModuleByIdUseCase,
      addLessonUseCase,
      addQuizUseCase
    );
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

container
  .bind<UploadTemporaryMediaUseCase>(TYPES.UploadTemporaryMediaUseCase)
  .toDynamicValue(context => {
    const repository = context.get<MediaRepository>(TYPES.MediaRepository);
    const storagePort = context.get<StoragePort>(TYPES.StoragePort);
    return new UploadTemporaryMediaUseCaseImpl(repository, storagePort, mediaBaseUrl);
  })
  .inSingletonScope();

container
  .bind<CleanupExpiredMediaUseCase>(TYPES.CleanupExpiredMediaUseCase)
  .toDynamicValue(context => {
    const repository = context.get<MediaRepository>(TYPES.MediaRepository);
    const storagePort = context.get<StoragePort>(TYPES.StoragePort);
    return new CleanupExpiredMediaUseCaseImpl(repository, storagePort);
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
    const uploadTempUC = context.get<UploadTemporaryMediaUseCase>(
      TYPES.UploadTemporaryMediaUseCase
    );

    return new MediaController(
      uploadUC,
      getByIdUC,
      getMediasUC,
      deleteUC,
      presignedUrlUC,
      uploadTempUC
    );
  })
  .inSingletonScope();

// ========== Media cleanup cron service ==========
container
  .bind<MediaCleanupCronService>(TYPES.MediaCleanupCronService)
  .toDynamicValue(context => {
    const cleanupUC = context.get<CleanupExpiredMediaUseCase>(TYPES.CleanupExpiredMediaUseCase);
    return new MediaCleanupCronService(cleanupUC);
  })
  .inSingletonScope();

// ========== Streaming repositories ==========
container
  .bind<HlsVariantRepository>(TYPES.HlsVariantRepository)
  .toDynamicValue(context => {
    const prismaClient = context.get<PrismaClient>('PrismaClient');
    return new PrismaHlsVariantRepository(prismaClient);
  })
  .inSingletonScope();

container
  .bind<TranscodingJobRepository>(TYPES.TranscodingJobRepository)
  .toDynamicValue(context => {
    const prismaClient = context.get<PrismaClient>('PrismaClient');
    return new PrismaTranscodingJobRepository(prismaClient);
  })
  .inSingletonScope();

container
  .bind<MediaProgressRepository>(TYPES.MediaProgressRepository)
  .toDynamicValue(context => {
    const prismaClient = context.get<PrismaClient>('PrismaClient');
    return new PrismaMediaProgressRepository(prismaClient);
  })
  .inSingletonScope();

container
  .bind<StreamTokenRepository>(TYPES.StreamTokenRepository)
  .toDynamicValue(context => {
    const prismaClient = context.get<PrismaClient>('PrismaClient');
    return new PrismaStreamTokenRepository(prismaClient);
  })
  .inSingletonScope();

// ========== Streaming services ==========
container
  .bind<TranscodingServicePort>(TYPES.TranscodingServicePort)
  .toDynamicValue(() => {
    return new FFmpegTranscodingService();
  })
  .inSingletonScope();

container
  .bind<BullMQJobQueue>(TYPES.BullMQJobQueue)
  .toDynamicValue(() => {
    return new BullMQJobQueue({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });
  })
  .inSingletonScope();

container
  .bind<JobQueuePort>(TYPES.JobQueuePort)
  .toDynamicValue(context => {
    return context.get<BullMQJobQueue>(TYPES.BullMQJobQueue);
  })
  .inSingletonScope();

// ========== Streaming use cases ==========
const streamBaseUrl = process.env.STREAM_BASE_URL || 'http://localhost:5000';

container
  .bind<StartTranscodingUseCase>(TYPES.StartTranscodingUseCase)
  .toDynamicValue(context => {
    const transcodingJobRepo = context.get<TranscodingJobRepository>(
      TYPES.TranscodingJobRepository
    );
    const mediaRepo = context.get<MediaRepository>(TYPES.MediaRepository);
    const jobQueue = context.get<JobQueuePort>(TYPES.JobQueuePort);
    return new StartTranscodingUseCaseImpl(transcodingJobRepo, mediaRepo, jobQueue);
  })
  .inSingletonScope();

container
  .bind<GetTranscodingStatusUseCase>(TYPES.GetTranscodingStatusUseCase)
  .toDynamicValue(context => {
    const transcodingJobRepo = context.get<TranscodingJobRepository>(
      TYPES.TranscodingJobRepository
    );
    return new GetTranscodingStatusUseCaseImpl(transcodingJobRepo);
  })
  .inSingletonScope();

container
  .bind<GetStreamManifestUseCase>(TYPES.GetStreamManifestUseCase)
  .toDynamicValue(context => {
    const hlsVariantRepo = context.get<HlsVariantRepository>(TYPES.HlsVariantRepository);
    const transcodingJobRepo = context.get<TranscodingJobRepository>(
      TYPES.TranscodingJobRepository
    );
    const mediaRepo = context.get<MediaRepository>(TYPES.MediaRepository);
    return new GetStreamManifestUseCaseImpl(
      hlsVariantRepo,
      transcodingJobRepo,
      mediaRepo,
      streamBaseUrl
    );
  })
  .inSingletonScope();

container
  .bind<UpdateProgressUseCase>(TYPES.UpdateProgressUseCase)
  .toDynamicValue(context => {
    const progressRepo = context.get<MediaProgressRepository>(TYPES.MediaProgressRepository);
    return new UpdateProgressUseCaseImpl(progressRepo);
  })
  .inSingletonScope();

container
  .bind<GetProgressUseCase>(TYPES.GetProgressUseCase)
  .toDynamicValue(context => {
    const progressRepo = context.get<MediaProgressRepository>(TYPES.MediaProgressRepository);
    return new GetProgressUseCaseImpl(progressRepo);
  })
  .inSingletonScope();

container
  .bind<GenerateStreamTokenUseCase>(TYPES.GenerateStreamTokenUseCase)
  .toDynamicValue(context => {
    const tokenRepo = context.get<StreamTokenRepository>(TYPES.StreamTokenRepository);
    const mediaRepo = context.get<MediaRepository>(TYPES.MediaRepository);
    return new GenerateStreamTokenUseCaseImpl(tokenRepo, mediaRepo);
  })
  .inSingletonScope();

// ========== Streaming controller ==========
const hlsBucket = process.env.HLS_BUCKET || 'finance4all-hls';

container
  .bind<StreamingController>(TYPES.StreamingController)
  .toDynamicValue(context => {
    const startTranscodingUC = context.get<StartTranscodingUseCase>(TYPES.StartTranscodingUseCase);
    const getTranscodingStatusUC = context.get<GetTranscodingStatusUseCase>(
      TYPES.GetTranscodingStatusUseCase
    );
    const getStreamManifestUC = context.get<GetStreamManifestUseCase>(
      TYPES.GetStreamManifestUseCase
    );
    const updateProgressUC = context.get<UpdateProgressUseCase>(TYPES.UpdateProgressUseCase);
    const getProgressUC = context.get<GetProgressUseCase>(TYPES.GetProgressUseCase);
    const generateStreamTokenUC = context.get<GenerateStreamTokenUseCase>(
      TYPES.GenerateStreamTokenUseCase
    );
    const storagePort = context.get<StoragePort>(TYPES.StoragePort);
    const hlsVariantRepo = context.get<HlsVariantRepository>(TYPES.HlsVariantRepository);

    return new StreamingController(
      startTranscodingUC,
      getTranscodingStatusUC,
      getStreamManifestUC,
      updateProgressUC,
      getProgressUC,
      generateStreamTokenUC,
      storagePort,
      hlsVariantRepo,
      hlsBucket,
      streamBaseUrl
    );
  })
  .inSingletonScope();

// ========== Transcoding worker ==========
container
  .bind<TranscodingWorker>(TYPES.TranscodingWorker)
  .toDynamicValue(context => {
    const transcodingService = context.get<TranscodingServicePort>(TYPES.TranscodingServicePort);
    const transcodingJobRepo = context.get<TranscodingJobRepository>(
      TYPES.TranscodingJobRepository
    );
    const hlsVariantRepo = context.get<HlsVariantRepository>(TYPES.HlsVariantRepository);
    const mediaRepo = context.get<MediaRepository>(TYPES.MediaRepository);
    const storagePort = context.get<StoragePort>(TYPES.StoragePort);

    return new TranscodingWorker(
      transcodingService,
      transcodingJobRepo,
      hlsVariantRepo,
      mediaRepo,
      storagePort
    );
  })
  .inSingletonScope();

// ========= Quiz controllers ==========
container
  .bind<QuizController>(TYPES.QuizController)
  .toDynamicValue(context => {
    const getQuizByIdUseCase = context.get<GetQuizByIdUseCaseImpl>(TYPES.GetQuizByIdUseCase);
    // const addQuizUseCase = context.get<AddQuizUseCase>(TYPES.AddQuizUseCase);

    return new QuizController(getQuizByIdUseCase);
  })
  .inSingletonScope();

// ========= Lesson controllers ==========
container
  .bind<LessonController>(TYPES.LessonController)
  .toDynamicValue(context => {
    const getLessonByIdUseCase = context.get<GetLessonByIdUseCase>(TYPES.GetLessonByIdUseCase);

    return new LessonController(getLessonByIdUseCase);
  })
  .inSingletonScope();

export { container };
