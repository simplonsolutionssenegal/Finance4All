// domain/formations/entities/Chapter.ts

import type { EntityId } from '@/domain/shared/EntityId';
import { DomainEntity } from '@/domain/shared/Entity';
import type { ChapterDTO } from '@/domain/formations/value-objects/ChapterDTO';
import type { Media } from '@/domain/media/entities/Media';

export class Chapter extends DomainEntity<EntityId> {
  private _title: string;
  private _description: string;
  private _mediaId?: string;
  private _order: number;
  private _media?: Media; // ✅ Ajout du média

  constructor(
    id: EntityId,
    title: string,
    description: string,
    mediaId?: string,
    order: number = 0,
    media?: Media, // ✅ Ajout du paramètre media
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id);

    this.validateTitle(title);
    this.validateDescription(description);
    this.validateOrder(order);

    this._title = title;
    this._description = description;
    this._mediaId = mediaId;
    this._order = order;
    this._media = media; // ✅ Assigner le média

    // ✅ Assigner les dates si fournies
    if (createdAt) {
      Object.assign(this, { _createdAt: createdAt });
    }
    if (updatedAt) {
      this._updatedAt = updatedAt;
    }
  }

  // --- Getters ---

  get title(): string {
    return this._title;
  }

  get description(): string {
    return this._description;
  }

  get mediaId(): string | undefined {
    return this._mediaId;
  }

  get order(): number {
    return this._order;
  }

  get media(): Media | undefined {
    // ✅ Nouveau getter
    return this._media;
  }

  // --- Validations privées ---

  private validateTitle(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new Error('Le titre du chapitre ne peut pas être vide');
    }
    if (title.length > 200) {
      throw new Error('Le titre du chapitre ne peut pas dépasser 200 caractères');
    }
  }

  private validateDescription(description: string): void {
    if (!description || description.trim().length === 0) {
      throw new Error('La description du chapitre ne peut pas être vide');
    }
  }

  private validateOrder(order: number): void {
    if (!Number.isInteger(order) || order < 0) {
      throw new Error("L'ordre doit être un entier positif ou zéro");
    }
  }

  // --- Updates ---

  updateTitle(title: string): void {
    this.validateTitle(title);
    this._title = title;
    this._updatedAt = new Date();
  }

  updateDescription(description: string): void {
    this.validateDescription(description);
    this._description = description;
    this._updatedAt = new Date();
  }

  updateOrder(order: number): void {
    this.validateOrder(order);
    this._order = order;
    this._updatedAt = new Date();
  }

  updateMedia(mediaId: string, media?: Media): void {
    // ✅ Nouvelle méthode
    this._mediaId = mediaId;
    this._media = media;
    this._updatedAt = new Date();
  }

  removeMedia(): void {
    // ✅ Nouvelle méthode
    this._mediaId = undefined;
    this._media = undefined;
    this._updatedAt = new Date();
  }

  // --- DTO ---

  toDTO(mediaBaseUrl?: string): ChapterDTO {
    // ✅ Ajout du paramètre mediaBaseUrl
    return {
      id: this.id.getValue(),
      title: this._title,
      description: this._description,
      mediaId: this._mediaId,
      order: this._order,
      media: this._media && mediaBaseUrl ? this._media.toDTO(mediaBaseUrl) : undefined, // ✅ Inclure le média
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
