import { DomainEntity } from '@/domain/shared/Entity';
import { EntityId } from '@/domain/shared/EntityId';
import type { MediaProgressDTO } from '../value-objects/StreamingDTO';

export interface MediaProgressProps {
  id: EntityId;
  userId: string;
  mediaId: string;
  currentPosition: number;
  duration: number;
  completionRate: number;
  isCompleted: boolean;
  lastWatchedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class MediaProgress extends DomainEntity<EntityId> {
  private readonly _userId: string;
  private readonly _mediaId: string;
  private _currentPosition: number;
  private _duration: number;
  private _completionRate: number;
  private _isCompleted: boolean;
  private _lastWatchedAt: Date;

  private static readonly COMPLETION_THRESHOLD = 95;

  constructor(props: MediaProgressProps) {
    super(props.id);
    this._userId = props.userId;
    this._mediaId = props.mediaId;
    this._currentPosition = props.currentPosition;
    this._duration = props.duration;
    this._completionRate = props.completionRate;
    this._isCompleted = props.isCompleted;
    this._lastWatchedAt = props.lastWatchedAt;

    if (props.createdAt) {
      Object.assign(this, { _createdAt: props.createdAt });
    }
    if (props.updatedAt) {
      this._updatedAt = props.updatedAt;
    }
  }

  get odId(): string {
    return this._id.getValue();
  }

  get userId(): string {
    return this._userId;
  }

  get mediaId(): string {
    return this._mediaId;
  }

  get currentPosition(): number {
    return this._currentPosition;
  }

  get duration(): number {
    return this._duration;
  }

  get completionRate(): number {
    return this._completionRate;
  }

  get isCompleted(): boolean {
    return this._isCompleted;
  }

  get lastWatchedAt(): Date {
    return this._lastWatchedAt;
  }

  updateProgress(position: number, duration: number): void {
    this._currentPosition = Math.max(0, position);
    this._duration = Math.max(0, duration);

    if (this._duration > 0) {
      this._completionRate = Math.min(100, (this._currentPosition / this._duration) * 100);
    }

    if (this._completionRate >= MediaProgress.COMPLETION_THRESHOLD && !this._isCompleted) {
      this._isCompleted = true;
    }

    this._lastWatchedAt = new Date();
    this._updatedAt = new Date();
  }

  markAsCompleted(): void {
    this._isCompleted = true;
    this._completionRate = 100;
    this._updatedAt = new Date();
  }

  reset(): void {
    this._currentPosition = 0;
    this._completionRate = 0;
    this._isCompleted = false;
    this._updatedAt = new Date();
  }

  toDTO(): MediaProgressDTO {
    return {
      id: this._id.getValue(),
      userId: this._userId,
      mediaId: this._mediaId,
      currentPosition: this._currentPosition,
      duration: this._duration,
      completionRate: this._completionRate,
      isCompleted: this._isCompleted,
      lastWatchedAt: this._lastWatchedAt,
    };
  }

  static create(userId: string, mediaId: string, duration: number = 0): MediaProgress {
    return new MediaProgress({
      id: EntityId.generate(),
      userId,
      mediaId,
      currentPosition: 0,
      duration,
      completionRate: 0,
      isCompleted: false,
      lastWatchedAt: new Date(),
    });
  }

  static fromPersistence(data: {
    id: string;
    userId: string;
    mediaId: string;
    currentPosition: number;
    duration: number;
    completionRate: number;
    isCompleted: boolean;
    lastWatchedAt: Date;
    createdAt: Date;
    updatedAt: Date;
  }): MediaProgress {
    return new MediaProgress({
      id: EntityId.from(data.id),
      userId: data.userId,
      mediaId: data.mediaId,
      currentPosition: data.currentPosition,
      duration: data.duration,
      completionRate: data.completionRate,
      isCompleted: data.isCompleted,
      lastWatchedAt: data.lastWatchedAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
