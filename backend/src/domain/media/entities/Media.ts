import { DomainEntity } from '@/domain/shared/Entity';
import { EntityId } from '@/domain/shared/EntityId';
import {
  type MediaType,
  getMediaTypeFromMimeType,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZES,
} from '../value-objects/MediaType';
import type { MediaDTO } from '../value-objects/MediaDTO';

export interface MediaProps {
  id: EntityId;
  filename: string;
  originalName: string;
  mimeType: string;
  type: MediaType;
  size: number;
  bucket: string;
  path: string;
  metadata: Record<string, string> | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Media extends DomainEntity<EntityId> {
  private readonly _filename: string;
  private readonly _originalName: string;
  private readonly _mimeType: string;
  private readonly _type: MediaType;
  private readonly _size: number;
  private readonly _bucket: string;
  private readonly _path: string;
  private _metadata: Record<string, string> | null;

  constructor(props: MediaProps) {
    super(props.id);

    this.validateMimeType(props.mimeType, props.type);
    this.validateFileSize(props.size, props.type);

    this._filename = props.filename;
    this._originalName = props.originalName;
    this._mimeType = props.mimeType;
    this._type = props.type;
    this._size = props.size;
    this._bucket = props.bucket;
    this._path = props.path;
    this._metadata = props.metadata;

    if (props.createdAt) {
      Object.assign(this, { _createdAt: props.createdAt });
    }
    if (props.updatedAt) {
      this._updatedAt = props.updatedAt;
    }
  }

  private validateMimeType(mimeType: string, type: MediaType): void {
    const allowedTypes = ALLOWED_MIME_TYPES[type];
    if (!allowedTypes.includes(mimeType)) {
      throw new Error(
        `Invalid mime type '${mimeType}' for media type '${type}'. Allowed types: ${allowedTypes.join(', ')}`
      );
    }
  }

  private validateFileSize(size: number, type: MediaType): void {
    const maxSize = MAX_FILE_SIZES[type];
    if (size > maxSize) {
      throw new Error(
        `File size ${size} exceeds maximum allowed size ${maxSize} for media type '${type}'`
      );
    }
  }

  get filename(): string {
    return this._filename;
  }

  get originalName(): string {
    return this._originalName;
  }

  get mimeType(): string {
    return this._mimeType;
  }

  get type(): MediaType {
    return this._type;
  }

  get size(): number {
    return this._size;
  }

  get bucket(): string {
    return this._bucket;
  }

  get path(): string {
    return this._path;
  }

  get metadata(): Record<string, string> | null {
    return this._metadata;
  }

  get fullPath(): string {
    return `${this._bucket}/${this._path}`;
  }

  updateMetadata(metadata: Record<string, string>): void {
    this._metadata = { ...this._metadata, ...metadata };
    this._updatedAt = new Date();
  }

  toDTO(baseUrl: string): MediaDTO {
    return {
      id: this._id.getValue(),
      filename: this._filename,
      originalName: this._originalName,
      mimeType: this._mimeType,
      type: this._type,
      size: this._size,
      url: `${baseUrl}/${this._bucket}/${this._path}`,
      bucket: this._bucket,
      path: this._path,
      metadata: this._metadata,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  static create(
    filename: string,
    originalName: string,
    mimeType: string,
    size: number,
    bucket: string,
    path: string,
    metadata?: Record<string, string>
  ): Media {
    const type = getMediaTypeFromMimeType(mimeType);
    if (!type) {
      throw new Error(`Unsupported mime type: ${mimeType}`);
    }

    return new Media({
      id: EntityId.generate(),
      filename,
      originalName,
      mimeType,
      type,
      size,
      bucket,
      path,
      metadata: metadata ?? null,
    });
  }
}
