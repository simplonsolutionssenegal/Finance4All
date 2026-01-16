import { DomainEntity } from '@/domain/shared/Entity';
import { EntityId } from '@/domain/shared/EntityId';
import type { StreamQuality } from '../value-objects/StreamQuality';
import type { HlsVariantDTO } from '../value-objects/StreamingDTO';

export interface HlsVariantProps {
  id: EntityId;
  mediaId: string;
  quality: StreamQuality;
  bandwidth: number;
  resolution: string | null;
  codecs: string;
  playlistPath: string;
  segmentPrefix: string;
  segmentCount: number;
  segmentDuration: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class HlsVariant extends DomainEntity<EntityId> {
  private readonly _mediaId: string;
  private readonly _quality: StreamQuality;
  private readonly _bandwidth: number;
  private readonly _resolution: string | null;
  private readonly _codecs: string;
  private readonly _playlistPath: string;
  private readonly _segmentPrefix: string;
  private _segmentCount: number;
  private readonly _segmentDuration: number;

  constructor(props: HlsVariantProps) {
    super(props.id);
    this._mediaId = props.mediaId;
    this._quality = props.quality;
    this._bandwidth = props.bandwidth;
    this._resolution = props.resolution;
    this._codecs = props.codecs;
    this._playlistPath = props.playlistPath;
    this._segmentPrefix = props.segmentPrefix;
    this._segmentCount = props.segmentCount;
    this._segmentDuration = props.segmentDuration;

    if (props.createdAt) {
      Object.assign(this, { _createdAt: props.createdAt });
    }
    if (props.updatedAt) {
      this._updatedAt = props.updatedAt;
    }
  }

  get mediaId(): string {
    return this._mediaId;
  }

  get quality(): StreamQuality {
    return this._quality;
  }

  get bandwidth(): number {
    return this._bandwidth;
  }

  get resolution(): string | null {
    return this._resolution;
  }

  get codecs(): string {
    return this._codecs;
  }

  get playlistPath(): string {
    return this._playlistPath;
  }

  get segmentPrefix(): string {
    return this._segmentPrefix;
  }

  get segmentCount(): number {
    return this._segmentCount;
  }

  get segmentDuration(): number {
    return this._segmentDuration;
  }

  updateSegmentCount(count: number): void {
    this._segmentCount = count;
    this._updatedAt = new Date();
  }

  toDTO(baseStreamUrl: string): HlsVariantDTO {
    return {
      id: this._id.getValue(),
      mediaId: this._mediaId,
      quality: this._quality,
      bandwidth: this._bandwidth,
      resolution: this._resolution,
      codecs: this._codecs,
      playlistUrl: `${baseStreamUrl}/${this._quality.toLowerCase()}/playlist.m3u8`,
    };
  }

  static create(
    mediaId: string,
    quality: StreamQuality,
    bandwidth: number,
    resolution: string | null,
    codecs: string,
    playlistPath: string,
    segmentPrefix: string,
    segmentDuration: number = 10.0
  ): HlsVariant {
    return new HlsVariant({
      id: EntityId.generate(),
      mediaId,
      quality,
      bandwidth,
      resolution,
      codecs,
      playlistPath,
      segmentPrefix,
      segmentCount: 0,
      segmentDuration,
    });
  }

  static fromPersistence(data: {
    id: string;
    mediaId: string;
    quality: StreamQuality;
    bandwidth: number;
    resolution: string | null;
    codecs: string;
    playlistPath: string;
    segmentPrefix: string;
    segmentCount: number;
    segmentDuration: number;
    createdAt: Date;
    updatedAt: Date;
  }): HlsVariant {
    return new HlsVariant({
      id: EntityId.from(data.id),
      mediaId: data.mediaId,
      quality: data.quality,
      bandwidth: data.bandwidth,
      resolution: data.resolution,
      codecs: data.codecs,
      playlistPath: data.playlistPath,
      segmentPrefix: data.segmentPrefix,
      segmentCount: data.segmentCount,
      segmentDuration: data.segmentDuration,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
