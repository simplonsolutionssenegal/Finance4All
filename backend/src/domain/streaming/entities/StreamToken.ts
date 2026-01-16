import { DomainEntity } from '@/domain/shared/Entity';
import { EntityId } from '@/domain/shared/EntityId';
import { randomBytes } from 'crypto';
import type { StreamTokenDTO } from '../value-objects/StreamingDTO';

export interface StreamTokenProps {
  id: EntityId;
  userId: string;
  mediaId: string;
  token: string;
  expiresAt: Date;
  createdAt?: Date;
}

export class StreamToken extends DomainEntity<EntityId> {
  private readonly _userId: string;
  private readonly _mediaId: string;
  private readonly _token: string;
  private readonly _expiresAt: Date;

  constructor(props: StreamTokenProps) {
    super(props.id);
    this._userId = props.userId;
    this._mediaId = props.mediaId;
    this._token = props.token;
    this._expiresAt = props.expiresAt;

    if (props.createdAt) {
      Object.assign(this, { _createdAt: props.createdAt });
    }
  }

  get userId(): string {
    return this._userId;
  }

  get mediaId(): string {
    return this._mediaId;
  }

  get token(): string {
    return this._token;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }

  get isExpired(): boolean {
    return new Date() > this._expiresAt;
  }

  isValidForMedia(mediaId: string): boolean {
    return this._mediaId === mediaId && !this.isExpired;
  }

  toDTO(): StreamTokenDTO {
    return {
      token: this._token,
      expiresAt: this._expiresAt,
    };
  }

  static create(userId: string, mediaId: string, expiresInSeconds: number = 3600): StreamToken {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    return new StreamToken({
      id: EntityId.generate(),
      userId,
      mediaId,
      token,
      expiresAt,
    });
  }

  static fromPersistence(data: {
    id: string;
    userId: string;
    mediaId: string;
    token: string;
    expiresAt: Date;
    createdAt: Date;
  }): StreamToken {
    return new StreamToken({
      id: EntityId.from(data.id),
      userId: data.userId,
      mediaId: data.mediaId,
      token: data.token,
      expiresAt: data.expiresAt,
      createdAt: data.createdAt,
    });
  }
}
