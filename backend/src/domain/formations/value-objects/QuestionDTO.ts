// import { TypeQuestion } from "../entities/Question";
import type { TypeQuestion, QuestionOption } from '../entities/Question';

export interface QuestionDTO {
  question: string;
  type: TypeQuestion;
  points: number;
  options: QuestionOption[];
  explication?: string;
}
