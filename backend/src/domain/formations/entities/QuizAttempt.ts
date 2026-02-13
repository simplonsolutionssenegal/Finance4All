import type { QuizAttemptDTO } from '@/domain/formations/value-objects/QuizAttemptDTO';

export interface QuizAttemptProps {
  id: string;
  quizId: string;
  userId: string;
  attemptNumber: number;
  earnedPoints: number;
  totalPoints: number;
  scorePercent: number;
  isPassed: boolean;
  answers?:
    | {
        questionIndex: number;
        selectedOptionIndexes: number[];
      }[]
    | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class QuizAttempt {
  private readonly _id: string;
  private readonly _quizId: string;
  private readonly _userId: string;
  private readonly _attemptNumber: number;
  private readonly _earnedPoints: number;
  private readonly _totalPoints: number;
  private readonly _scorePercent: number;
  private readonly _isPassed: boolean;
  private readonly _answers:
    | {
        questionIndex: number;
        selectedOptionIndexes: number[];
      }[]
    | null;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(props: QuizAttemptProps) {
    if (!Number.isInteger(props.attemptNumber) || props.attemptNumber < 1) {
      throw new Error('Le numero de tentative doit etre superieur ou egal a 1');
    }

    if (!Number.isInteger(props.earnedPoints) || props.earnedPoints < 0) {
      throw new Error('Les points obtenus doivent etre un entier positif');
    }

    if (!Number.isInteger(props.totalPoints) || props.totalPoints < 0) {
      throw new Error('Les points totaux doivent etre un entier positif');
    }

    if (props.earnedPoints > props.totalPoints) {
      throw new Error('Les points obtenus ne peuvent pas depasser les points totaux');
    }

    if (
      !Number.isFinite(props.scorePercent) ||
      props.scorePercent < 0 ||
      props.scorePercent > 100
    ) {
      throw new Error('Le pourcentage doit etre compris entre 0 et 100');
    }

    this._id = props.id;
    this._quizId = props.quizId;
    this._userId = props.userId;
    this._attemptNumber = props.attemptNumber;
    this._earnedPoints = props.earnedPoints;
    this._totalPoints = props.totalPoints;
    this._scorePercent = props.scorePercent;
    this._isPassed = props.isPassed;
    this._answers = props.answers ?? null;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? this._createdAt;
  }

  get id(): string {
    return this._id;
  }

  get quizId(): string {
    return this._quizId;
  }

  get userId(): string {
    return this._userId;
  }

  get attemptNumber(): number {
    return this._attemptNumber;
  }

  get earnedPoints(): number {
    return this._earnedPoints;
  }

  get totalPoints(): number {
    return this._totalPoints;
  }

  get scorePercent(): number {
    return this._scorePercent;
  }

  get isPassed(): boolean {
    return this._isPassed;
  }

  get answers(): { questionIndex: number; selectedOptionIndexes: number[] }[] | null {
    return this._answers;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  toDTO(): QuizAttemptDTO {
    return {
      id: this._id,
      quizId: this._quizId,
      userId: this._userId,
      attemptNumber: this._attemptNumber,
      earnedPoints: this._earnedPoints,
      totalPoints: this._totalPoints,
      scorePercent: this._scorePercent,
      isPassed: this._isPassed,
      answers: this._answers,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
