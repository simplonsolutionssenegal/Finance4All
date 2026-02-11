export enum TypeQuestion {
  CHOIX_UNIQUE = 'CHOIX_UNIQUE',
  CHOIX_MULTIPLE = 'CHOIX_MULTIPLE',
}

export type QuestionOption = {
  text: string;
  isCorrect: boolean;
};

export interface QuestionDTO {
  question: string;
  type: TypeQuestion;
  points: number;
  options: QuestionOption[];
  explication?: string;
}
