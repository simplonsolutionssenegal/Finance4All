import type { QuestionDTO } from '@/domain/formations/value-objects/QuestionDTO';
import {
  QuestionChoixMultiple,
  QuestionChoixUnique,
  TypeQuestion,
  type Question,
} from '@/domain/formations/entities/Question';

export function questionsFromJson(raw: unknown): Question[] {
  const dtos: QuestionDTO[] = Array.isArray(raw) ? (raw as unknown as QuestionDTO[]) : [];
  return dtos.map(questionFromDTO);
}

export function questionFromDTO(dto: QuestionDTO): Question {
  if (dto.type === TypeQuestion.CHOIX_UNIQUE) {
    return new QuestionChoixUnique(dto.question, dto.points, dto.options, dto.explication);
  }
  if (dto.type === TypeQuestion.CHOIX_MULTIPLE) {
    return new QuestionChoixMultiple(dto.question, dto.points, dto.options, dto.explication);
  }
  throw new Error(`TypeQuestion inconnu: ${String((dto as any).type)}`);
}
