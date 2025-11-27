//domain/formations/entities/Module.ts

import { DomainEntity } from '@/domain/shared/Entity';
import type { Thematic } from '../value-objects/Thematic';
import type { EntityId } from '@/domain/shared/EntityId';
import type { ModuleResponseDTO } from '../value-objects/ModuleFormationDTO';

export enum ModuleStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
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
  imageUrl: string | null;
  thematics: Thematic[];
  difficultyLevel: DifficultyLevel;
  estimatedDuration: number;
  status: ModuleStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Module extends DomainEntity<EntityId> {
  private _title: string;
  private _description: string;
  private _thematics: Thematic[];
  private _imageUrl: string | null;
  private _difficultyLevel: DifficultyLevel;
  private _estimatedDuration: number;
  private _status: ModuleStatus;

  constructor(props: ModuleProps) {
    super(props.id);
    this._title = props.title;
    this._imageUrl = props.imageUrl;
    this._description = props.description;
    this._thematics = props.thematics;
    this._difficultyLevel = props.difficultyLevel;
    this._estimatedDuration = props.estimatedDuration;
    this._status = props.status;
  }

  public static create(props: ModuleProps): Module {
    // Validation des règles métier
    if (!props.title || props.title.trim().length === 0) {
      throw new Error('Le titre du module est obligatoire');
    }

    if (props.title.length > 200) {
      throw new Error('Le titre ne peut pas dépasser 200 caractères');
    }

    if (props.imageUrl !== null && props.imageUrl.trim().length === 0) {
      throw new Error("L'URL de l'image ne peut pas être une chaîne vide");
    }

    if (!props.description || props.description.trim().length === 0) {
      throw new Error('La description du module est obligatoire');
    }

    if (!props.thematics || props.thematics.length === 0) {
      throw new Error('Au moins une thématique est requise');
    }

    if (props.estimatedDuration <= 0) {
      throw new Error('La durée estimée doit être supérieure à 0');
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
  get imageUrl(): string | null {
    return this._imageUrl;
  }

  get thematics(): Thematic[] {
    return [...this._thematics];
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

  public updateImageUrl(imageUrl: string | null): void {
    if (!imageUrl || imageUrl.trim().length === 0) {
      throw new Error("L'URL de l'image est obligatoire");
    }
    this._imageUrl = imageUrl;
    this._updatedAt = new Date();
  }

  public updateDescription(description: string): void {
    if (!description || description.trim().length === 0) {
      throw new Error('La description du module est obligatoire');
    }
    this._description = description;
    this._updatedAt = new Date();
  }

  public addThematic(thematic: Thematic): void {
    if (!this._thematics.includes(thematic)) {
      this._thematics.push(thematic);
      this._updatedAt = new Date();
    }
  }

  public removeThematic(thematic: Thematic): void {
    const index = this._thematics.indexOf(thematic);
    if (index > -1) {
      if (this._thematics.length === 1) {
        throw new Error('Le module doit avoir au moins une thématique');
      }
      this._thematics.splice(index, 1);
      this._updatedAt = new Date();
    }
  }

  public hasThematic(thematic: Thematic): boolean {
    return this._thematics.includes(thematic);
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
      imageUrl: this._imageUrl,
      difficultyLevel: this._difficultyLevel,
      estimatedDuration: this._estimatedDuration,
      status: this._status,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
