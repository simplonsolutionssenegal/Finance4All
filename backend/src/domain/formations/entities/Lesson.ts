// domain/formations/entities/Lesson.ts

import type { EntityId } from '@/domain/shared/EntityId';
import { DomainEntity } from '@/domain/shared/Entity';
import type { Chapter } from './Chapter';
import type { LessonDTO } from '@/domain/formations/value-objects/LessonDTO';
import type { Quiz } from './Quiz';
import { assertMaxLength, assertNotBlank } from '@/infrastructure/web/validators/textRules';

export enum LessonStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  SCHEDULED = 'SCHEDULED',
}

export interface LessonProps {
  id: EntityId;
  moduleId: string; // ⭐ AJOUT
  title: string;
  description: string;
  duration: number;
  order: number;
  status: LessonStatus;
  chapters: Chapter[];
  quizzes: Quiz[];
}

export class Lesson extends DomainEntity<EntityId> {
  private _moduleId: string; // ⭐ AJOUT
  private _title: string;
  private _description: string;
  private _duration: number;
  private _order: number;
  private _status: LessonStatus;
  private _chapters: Chapter[];
  private readonly _quizzes: Set<Quiz>;

  constructor(props: LessonProps) {
    super(props.id);

    this.validateDuration(props.duration);
    this.validateOrder(props.order);

    this._moduleId = props.moduleId; // ⭐ AJOUT
    this._title = props.title;
    this._description = props.description;
    this._duration = props.duration;
    this._order = props.order;
    this._status = props.status;
    this._chapters = props.chapters;
    this._quizzes = new Set(props.quizzes);
  }

  get moduleId(): string {
    return this._moduleId;
  }

  get title(): string {
    return this._title;
  }

  get description(): string {
    return this._description;
  }

  get duration(): number {
    return this._duration;
  }

  get order(): number {
    return this._order;
  }

  get status(): LessonStatus {
    return this._status;
  }

  get chapters(): Chapter[] {
    return this._chapters;
  }

  get chaptersCount(): number {
    return this._chapters.length;
  }

  get quizzes(): Quiz[] {
    return Array.from(this._quizzes);
  }

  addQuiz(quiz: Quiz): void {
    this._quizzes.add(quiz);
    this._updatedAt = new Date();
  }

  private validateDuration(duration: number): void {
    if (duration <= 0) {
      throw new Error('La durée doit être supérieure à 0');
    }
  }

  private validateOrder(order: number): void {
    if (!Number.isInteger(order) || order < 0) {
      throw new Error("L'ordre doit être un entier positif ou zéro");
    }
  }

  // --- Méthodes métier (inchangées) ---

  publish(): void {
    if (this._status === LessonStatus.ARCHIVED) {
      throw new Error('Impossible de publier une leçon archivée');
    }
    if (this._chapters.length === 0) {
      throw new Error('Impossible de publier une leçon sans chapitres');
    }
    this._status = LessonStatus.PUBLISHED;
    this._updatedAt = new Date();
  }

  draft(): void {
    if (this._status === LessonStatus.ARCHIVED) {
      throw new Error('Impossible de remettre en brouillon une leçon archivée');
    }
    this._status = LessonStatus.DRAFT;
    this._updatedAt = new Date();
  }

  archive(): void {
    this._status = LessonStatus.ARCHIVED;
    this._updatedAt = new Date();
  }

  schedule(): void {
    if (this._status === LessonStatus.ARCHIVED) {
      throw new Error('Impossible de programmer une leçon archivée');
    }
    this._status = LessonStatus.SCHEDULED;
    this._updatedAt = new Date();
  }

  // --- Updates ---

  updateTitle(title: string): void {
    assertNotBlank(title, 'Le titre de la leçon ne peut pas être vide');
    assertMaxLength(title, 200, 'Le titre de la leçon ne peut pas dépasser 200 caractères');
    this._title = title;
    this._updatedAt = new Date();
  }

  updateDescription(description: string): void {
    assertNotBlank(description, 'La description de la leçon ne peut pas être vide');
    this._description = description;
    this._updatedAt = new Date();
  }

  updateDuration(duration: number): void {
    this.validateDuration(duration);
    this._duration = duration;
    this._updatedAt = new Date();
  }

  updateOrder(order: number): void {
    this.validateOrder(order);
    this._order = order;
    this._updatedAt = new Date();
  }

  // --- Gestion des chapitres ---

  addChapter(chapter: Chapter): void {
    this._chapters.push(chapter);
    this._updatedAt = new Date();
  }

  removeChapterAt(index: number): void {
    if (index < 0 || index >= this._chapters.length) {
      throw new Error('Index de chapitre invalide');
    }
    this._chapters.splice(index, 1);
    this._updatedAt = new Date();
  }

  removeChapterById(chapterId: string): void {
    const index = this._chapters.findIndex(c => c.id.getValue() === chapterId);
    if (index === -1) {
      throw new Error('Chapitre non trouvé');
    }
    this._chapters.splice(index, 1);
    this._updatedAt = new Date();
  }

  updateChapterAt(index: number, updatedChapter: Chapter): void {
    if (index < 0 || index >= this._chapters.length) {
      throw new Error('Index de chapitre invalide');
    }
    this._chapters[index] = updatedChapter;
    this._updatedAt = new Date();
  }

  reorderChapters(newOrder: Chapter[]): void {
    if (newOrder.length !== this._chapters.length) {
      throw new Error('Le nombre de chapitres doit rester le même');
    }
    this._chapters = newOrder;
    this._updatedAt = new Date();
  }

  // --- DTO ---

  toDTO(): LessonDTO {
    return {
      id: this.id.getValue(),
      moduleId: this._moduleId, // ⭐ AJOUT
      title: this._title,
      description: this._description,
      duration: this._duration,
      order: this._order,
      status: this._status,
      chapters: this._chapters.map(c => c.toDTO()),
      quizzes: this.quizzes.map(quiz => quiz.toDTO()),
      chaptersCount: this.chaptersCount,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
