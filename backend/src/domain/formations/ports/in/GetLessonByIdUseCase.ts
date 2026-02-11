import type { UseCase } from '@/domain/shared/UseCase';
import type { LessonDTO } from '../../value-objects/LessonDTO';

export interface GetLessonByIdUseCaseQuery {
  id: string;
}

export interface GetLessonByIdUseCase extends UseCase<GetLessonByIdUseCaseQuery, LessonDTO> {}
