import type { UseCase } from '@/domain/shared/UseCase';

export interface GetPresignedUrlQuery {
  mediaId: string;
  expiresIn?: number; // seconds
}

export interface PresignedUrlResult {
  url: string;
  expiresAt: Date;
}

export interface GetPresignedUrlUseCase extends UseCase<GetPresignedUrlQuery, PresignedUrlResult> {}
