// domain/formations/entities/Quiz.ts

import type { EntityId } from '@/domain/shared/EntityId';
import { DomainEntity } from '@/domain/shared/Entity';
import type { Question } from './Question';
import type { QuizDTO } from '@/domain/formations/value-objects/QuizDTO';

export enum QuizStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export interface QuizProps {
  id: EntityId;
  title: string;
  description: string;
  status: QuizStatus;
  scoreMinimum: number;
  duree?: number;
  nombreTentatives: number;
  questions: Question[];
}

export class Quiz extends DomainEntity<EntityId> {
  private _title: string;
  private _description: string;
  private _status: QuizStatus;
  private _scoreMinimum: number;
  private _duree?: number;
  private _nombreTentatives: number;
  private _questions: Question[];

  constructor(props: QuizProps) {
    super(props.id);

    this.validateScoreMinimum(props.scoreMinimum);
    this.validateNombreTentatives(props.nombreTentatives);

    this._title = props.title;
    this._description = props.description;
    this._status = props.status;
    this._scoreMinimum = props.scoreMinimum;
    this._duree = props.duree;
    this._nombreTentatives = props.nombreTentatives;
    this._questions = props.questions;
  }

  // --- Getters ---

  get title(): string {
    return this._title;
  }

  get description(): string {
    return this._description;
  }

  get status(): QuizStatus {
    return this._status;
  }

  get scoreMinimum(): number {
    return this._scoreMinimum;
  }

  get duree(): number | undefined {
    return this._duree;
  }

  get nombreTentatives(): number {
    return this._nombreTentatives;
  }

  get questions(): Question[] {
    return this._questions;
  }

  get isIllimite(): boolean {
    return this._duree === undefined;
  }

  get totalPoints(): number {
    return this._questions.reduce((sum, q) => sum + q.points, 0);
  }

  // --- Validations privées ---

  private validateScoreMinimum(score: number): void {
    if (!Number.isInteger(score) || score < 0 || score > 100) {
      throw new Error('Le score minimum doit être un entier entre 0 et 100');
    }
  }

  private validateNombreTentatives(tentatives: number): void {
    if (!Number.isInteger(tentatives) || tentatives < 1 || tentatives > 3) {
      throw new Error('Le nombre de tentatives doit être entre 1 et 3');
    }
  }

  // --- Méthodes métier ---

  publish(): void {
    if (this._status === QuizStatus.ARCHIVED) {
      throw new Error('Impossible de publier un quiz archivé');
    }
    if (this._questions.length === 0) {
      throw new Error('Impossible de publier un quiz sans questions');
    }
    this._status = QuizStatus.PUBLISHED;
    this._updatedAt = new Date();
  }

  draft(): void {
    if (this._status === QuizStatus.ARCHIVED) {
      throw new Error('Impossible de remettre en brouillon un quiz archivé');
    }
    this._status = QuizStatus.DRAFT;
    this._updatedAt = new Date();
  }

  archive(): void {
    this._status = QuizStatus.ARCHIVED;
    this._updatedAt = new Date();
  }

  // --- Updates ---

  updateTitle(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new Error('Le titre ne peut pas être vide');
    }
    if (title.length > 200) {
      throw new Error('Le titre ne peut pas dépasser 200 caractères');
    }
    this._title = title;
    this._updatedAt = new Date();
  }

  updateDescription(description: string): void {
    if (!description || description.trim().length === 0) {
      throw new Error('La description ne peut pas être vide');
    }
    this._description = description;
    this._updatedAt = new Date();
  }

  updateScoreMinimum(score: number): void {
    this.validateScoreMinimum(score);
    this._scoreMinimum = score;
    this._updatedAt = new Date();
  }

  updateDuree(duree?: number): void {
    if (duree !== undefined && (!Number.isInteger(duree) || duree <= 0)) {
      throw new Error('La durée doit être un entier positif ou non définie (illimité)');
    }
    this._duree = duree;
    this._updatedAt = new Date();
  }

  updateNombreTentatives(tentatives: number): void {
    this.validateNombreTentatives(tentatives);
    this._nombreTentatives = tentatives;
    this._updatedAt = new Date();
  }

  // --- Gestion des questions ---

  addQuestion(question: Question): void {
    this._questions.push(question);
    this._updatedAt = new Date();
  }

  removeQuestionAt(index: number): void {
    if (index < 0 || index >= this._questions.length) {
      throw new Error('Index de question invalide');
    }
    this._questions.splice(index, 1);
    this._updatedAt = new Date();
  }

  removeQuestion(questionText: string): void {
    const index = this._questions.findIndex(q => q.question === questionText);
    if (index === -1) {
      throw new Error('Question non trouvée');
    }
    this._questions.splice(index, 1);
    this._updatedAt = new Date();
  }

  updateQuestionAt(index: number, updatedQuestion: Question): void {
    if (index < 0 || index >= this._questions.length) {
      throw new Error('Index de question invalide');
    }
    this._questions[index] = updatedQuestion;
    this._updatedAt = new Date();
  }

  // --- DTO ---

  toDTO(): QuizDTO {
    return {
      id: this.id.getValue(),
      title: this._title,
      description: this._description,
      status: this._status,
      scoreMinimum: this._scoreMinimum,
      duree: this._duree,
      nombreTentatives: this._nombreTentatives,
      questions: this._questions.map(q => q.toDTO()),
      totalPoints: this.totalPoints,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
