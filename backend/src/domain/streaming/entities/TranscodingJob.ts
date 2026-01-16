import { DomainEntity } from '@/domain/shared/Entity';
import { EntityId } from '@/domain/shared/EntityId';
import { TranscodingStatus } from '../value-objects/TranscodingStatus';
import type { TranscodingJobDTO } from '../value-objects/StreamingDTO';

export interface TranscodingJobProps {
  id: EntityId;
  mediaId: string;
  status: TranscodingStatus;
  progress: number;
  errorMessage: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class TranscodingJob extends DomainEntity<EntityId> {
  private readonly _mediaId: string;
  private _status: TranscodingStatus;
  private _progress: number;
  private _errorMessage: string | null;
  private _startedAt: Date | null;
  private _completedAt: Date | null;

  constructor(props: TranscodingJobProps) {
    super(props.id);
    this._mediaId = props.mediaId;
    this._status = props.status;
    this._progress = props.progress;
    this._errorMessage = props.errorMessage;
    this._startedAt = props.startedAt;
    this._completedAt = props.completedAt;

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

  get status(): TranscodingStatus {
    return this._status;
  }

  get progress(): number {
    return this._progress;
  }

  get errorMessage(): string | null {
    return this._errorMessage;
  }

  get startedAt(): Date | null {
    return this._startedAt;
  }

  get completedAt(): Date | null {
    return this._completedAt;
  }

  start(): void {
    if (this._status !== TranscodingStatus.PENDING) {
      throw new Error('Can only start a pending job');
    }
    this._status = TranscodingStatus.PROCESSING;
    this._startedAt = new Date();
    this._updatedAt = new Date();
  }

  updateProgress(progress: number): void {
    if (this._status !== TranscodingStatus.PROCESSING) {
      throw new Error('Can only update progress of a processing job');
    }
    this._progress = Math.min(100, Math.max(0, progress));
    this._updatedAt = new Date();
  }

  complete(): void {
    this._status = TranscodingStatus.COMPLETED;
    this._progress = 100;
    this._completedAt = new Date();
    this._updatedAt = new Date();
  }

  fail(errorMessage: string): void {
    this._status = TranscodingStatus.FAILED;
    this._errorMessage = errorMessage;
    this._completedAt = new Date();
    this._updatedAt = new Date();
  }

  toDTO(): TranscodingJobDTO {
    return {
      id: this._id.getValue(),
      mediaId: this._mediaId,
      status: this._status,
      progress: this._progress,
      errorMessage: this._errorMessage,
      startedAt: this._startedAt,
      completedAt: this._completedAt,
      createdAt: this._createdAt,
    };
  }

  static create(mediaId: string): TranscodingJob {
    return new TranscodingJob({
      id: EntityId.generate(),
      mediaId,
      status: TranscodingStatus.PENDING,
      progress: 0,
      errorMessage: null,
      startedAt: null,
      completedAt: null,
    });
  }

  static fromPersistence(data: {
    id: string;
    mediaId: string;
    status: TranscodingStatus;
    progress: number;
    errorMessage: string | null;
    startedAt: Date | null;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): TranscodingJob {
    return new TranscodingJob({
      id: EntityId.from(data.id),
      mediaId: data.mediaId,
      status: data.status,
      progress: data.progress,
      errorMessage: data.errorMessage,
      startedAt: data.startedAt,
      completedAt: data.completedAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
