// domain/formations/value-objects/ChapterDTO.ts

export interface ChapterDTO {
  title: string;
  description: string;
  mediaId: string; // ID référençant le modèle Media externe
  order: number;
}
