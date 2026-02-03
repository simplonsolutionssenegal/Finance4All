//domain/formations/entities/Module.ts

import { DomainEntity } from '@/domain/shared/Entity';
import type { EntityId } from '@/domain/shared/EntityId';
import type { ModuleResponseDTO } from '../value-objects/ModuleFormationDTO';
import type { Quiz } from './Quiz';
import type { Lesson } from '@/domain/formations/entities/Lesson';

export enum ModuleStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}
export enum MediaType {
  VIDEO = 'VIDEO',
  PDF = 'PDF',
  AUDIO = 'AUDIO',
  IMAGE = 'IMAGE',
}

export enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

export interface ModuleProps {
  id: EntityId;
  title: string;
  description: string;
  imageMediaId: string | null;
  thematics: string;
  difficultyLevel: DifficultyLevel;
  estimatedDuration: number;
  status: ModuleStatus;
  lessons: Lesson[];
  quizzes: Quiz[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Module extends DomainEntity<EntityId> {
  private _title: string;
  private _description: string;
  private _thematics: string;
  private _imageMediaId: string | null;
  private _difficultyLevel: DifficultyLevel;
  private _estimatedDuration: number;
  private _status: ModuleStatus;
  private readonly _lessons: Set<Lesson>;
  private readonly _quizzes: Set<Quiz>;

  constructor(props: ModuleProps) {
    super(props.id);
    this._title = props.title;
    this._imageMediaId = props.imageMediaId;
    this._description = props.description;
    this._thematics = props.thematics;
    this._difficultyLevel = props.difficultyLevel;
    this._estimatedDuration = props.estimatedDuration;
    this._status = props.status;

    // Préserver les dates si fournies (pour la reconstitution depuis la BD)
    if (props.createdAt) {
      Object.defineProperty(this, '_createdAt', {
        value: props.createdAt,
        writable: false,
        enumerable: false,
        configurable: true,
      });
    }
    if (props.updatedAt) {
      Object.defineProperty(this, '_updatedAt', {
        value: props.updatedAt,
        writable: true,
        enumerable: false,
        configurable: true,
      });
    }

    this._lessons = new Set(props.lessons);
    this._quizzes = new Set(props.quizzes);
  }

  public static create(props: ModuleProps): Module {
    // Validation des règles métier
    if (!props.title || props.title.trim().length === 0) {
      throw new Error('Le titre du module est obligatoire');
    }

    if (props.title.length > 200) {
      throw new Error('Le titre ne peut pas dépasser 200 caractères');
    }

    if (!props.description || props.description.trim().length === 0) {
      throw new Error('La description du module est obligatoire');
    }
    if (!props.thematics || props.thematics.trim().length === 0) {
      throw new Error('Au moins une thématique est requise');
    }

    if (props.estimatedDuration <= 0) {
      throw new Error('La durée estimée doit être supérieure à 0');
    }

    if (props.estimatedDuration > 10080) {
      throw new Error('La durée maximale est de 7 jours');
    }

    if (!Object.values(DifficultyLevel).includes(props.difficultyLevel)) {
      throw new Error("Le niveau de difficulté n'est pas valide");
    }
    if (!Object.values(ModuleStatus).includes(props.status)) {
      throw new Error("Le statut du module n'est pas valide");
    }

    // Créer et retourner l'instance
    return new Module(props);
  }

  get title(): string {
    return this._title;
  }

  get description(): string {
    return this._description;
  }

  get imageMediaId(): string | null {
    return this._imageMediaId;
  }

  get thematics(): string {
    return this._thematics;
  }

  get difficultyLevel(): DifficultyLevel {
    return this._difficultyLevel;
  }

  get estimatedDuration(): number {
    return this._estimatedDuration;
  }

  get status(): ModuleStatus {
    return this._status;
  }

  get createdAt(): Date {
    return this._createdAt || new Date();
  }

  get updatedAt(): Date {
    return this._updatedAt || new Date();
  }

  get lessons(): Lesson[] {
    return Array.from(this._lessons);
  }

  get quizzes(): Quiz[] {
    return Array.from(this._quizzes);
  }

  addLesson(lesson: Lesson): void {
    this._lessons.add(lesson);
    this._updatedAt = new Date();
  }

  addQuiz(quiz: Quiz): void {
    this._quizzes.add(quiz);
    this._updatedAt = new Date();
  }

  getAllQuizzes(): Quiz[] {
    const allQuizzes: Quiz[] = [];
    allQuizzes.push(...this.quizzes);
    for (const lesson of this._lessons) {
      allQuizzes.push(...lesson.quizzes);

      for (const chapter of lesson.chapters) {
        allQuizzes.push(...chapter.quizzes);
      }
    }

    return allQuizzes;
  }

  public publish(): void {
    if (this._status === ModuleStatus.PUBLISHED) {
      throw new Error('Le module est déjà publié');
    }
    this._status = ModuleStatus.PUBLISHED;
    this._updatedAt = new Date();
  }

  public updateTitle(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new Error('Le titre du module est obligatoire');
    }
    this._title = title;
    this._updatedAt = new Date();
  }

  public updateDescription(description: string): void {
    if (!description || description.trim().length === 0) {
      throw new Error('La description du module est obligatoire');
    }
    this._description = description;
    this._updatedAt = new Date();
  }

  public isPublished(): boolean {
    return this._status === ModuleStatus.PUBLISHED;
  }

  public isDraft(): boolean {
    return this._status === ModuleStatus.DRAFT;
  }

  public isArchived(): boolean {
    return this._status === ModuleStatus.ARCHIVED;
  }

  public toDTO(): ModuleResponseDTO {
    return {
      id: this._id.getValue(),
      title: this._title,
      description: this._description,
      thematics: this._thematics,
      imageMediaId: this._imageMediaId,
      difficultyLevel: this._difficultyLevel,
      estimatedDuration: this._estimatedDuration,
      status: this._status,
      lessons: this.lessons.map(lesson => lesson.toDTO()),
      quizzes: this.quizzes.map(quiz => quiz.toDTO()),
      quizzesGlobal: this.getAllQuizzes().map(q => q.toDTO()),
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
