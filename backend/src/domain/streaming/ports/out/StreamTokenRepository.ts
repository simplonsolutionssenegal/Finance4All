import type { StreamToken } from '../../entities/StreamToken';

export interface StreamTokenRepository {
  save(token: StreamToken): Promise<StreamToken>;
  findByToken(token: string): Promise<StreamToken | null>;
  deleteExpired(): Promise<number>;
  deleteByMediaId(mediaId: string): Promise<void>;
}
