import type { ChapterDTO } from '@/domain/formations/value-objects/ChapterDTO';

export class Chapter {
  readonly title: string;
  readonly description: string;
  readonly mediaId: string; // Référence vers le modèle Media externe
  readonly order: number;

  constructor(title: string, description: string, mediaId: string, order: number = 0) {
    this.validateTitle(title);
    this.validateDescription(description);
    this.validateMediaId(mediaId);
    this.validateOrder(order);

    this.title = title;
    this.description = description;
    this.mediaId = mediaId;
    this.order = order;
  }

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

  private validateMediaId(mediaId: string): void {
    if (!mediaId || mediaId.trim().length === 0) {
      throw new Error('Le mediaId ne peut pas être vide');
    }
  }

  private validateOrder(order: number): void {
    if (!Number.isInteger(order) || order < 0) {
      throw new Error("L'ordre doit être un entier positif ou zéro");
    }
  }

  // --- DTO ---

  toDTO(): ChapterDTO {
    return {
      title: this.title,
      description: this.description,
      mediaId: this.mediaId,
      order: this.order,
    };
  }
}
