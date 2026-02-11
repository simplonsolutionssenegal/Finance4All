import type { QuestionDTO } from '@/domain/formations/value-objects/QuestionDTO';

export enum TypeQuestion {
  CHOIX_UNIQUE = 'CHOIX_UNIQUE',
  CHOIX_MULTIPLE = 'CHOIX_MULTIPLE',
}

export type QuestionOption = {
  text: string;
  isCorrect: boolean;
};

export abstract class Question {
  abstract readonly _type: TypeQuestion;
  abstract readonly question: string;
  abstract readonly points: number;
  abstract toDTO(): QuestionDTO;
}

export class QuestionChoixUnique extends Question {
  readonly _type = TypeQuestion.CHOIX_UNIQUE;
  readonly question: string;
  readonly points: number;
  readonly options: QuestionOption[];
  readonly explication?: string;

  constructor(question: string, points: number, options: QuestionOption[], explication?: string) {
    super();

    // Validation: une seule réponse correcte
    const correctAnswers = options.filter(opt => opt.isCorrect);
    if (correctAnswers.length !== 1) {
      throw new Error('Une question à choix unique doit avoir exactement une réponse correcte');
    }

    this.question = question;
    this.points = points;
    this.options = options;
    this.explication = explication;
  }

  toDTO(): QuestionDTO {
    return {
      question: this.question,
      type: this._type,
      points: this.points,
      options: this.options,
      explication: this.explication,
    };
  }
}

export class QuestionChoixMultiple extends Question {
  readonly _type = TypeQuestion.CHOIX_MULTIPLE;
  readonly question: string;
  readonly points: number;
  readonly options: QuestionOption[];
  readonly explication?: string;

  constructor(question: string, points: number, options: QuestionOption[], explication?: string) {
    super();

    // Validation: au moins deux réponses correctes
    const correctAnswers = options.filter(opt => opt.isCorrect);
    if (correctAnswers.length < 2) {
      throw new Error('Une question à choix multiple doit avoir au moins deux réponses correctes');
    }

    this.question = question;
    this.points = points;
    this.options = options;
    this.explication = explication;
  }

  toDTO(): QuestionDTO {
    return {
      question: this.question,
      type: this._type,
      points: this.points,
      options: this.options,
      explication: this.explication,
    };
  }
}
