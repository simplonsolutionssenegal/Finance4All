import type { HlsVariant } from '../../entities/HlsVariant';
import type { StreamQuality } from '../../value-objects/StreamQuality';

export interface HlsVariantRepository {
  save(variant: HlsVariant): Promise<HlsVariant>;
  saveMany(variants: HlsVariant[]): Promise<HlsVariant[]>;
  findByMediaId(mediaId: string): Promise<HlsVariant[]>;
  findByMediaIdAndQuality(mediaId: string, quality: StreamQuality): Promise<HlsVariant | null>;
  deleteByMediaId(mediaId: string): Promise<void>;
}
