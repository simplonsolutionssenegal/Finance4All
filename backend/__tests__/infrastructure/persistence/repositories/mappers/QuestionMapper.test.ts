import {
  questionsFromJson,
  questionFromDTO,
} from '@/infrastructure/persistence/repositories/mappers/QuestionMapper';
import {
  QuestionChoixMultiple,
  QuestionChoixUnique,
  TypeQuestion,
} from '@/domain/formations/entities/Question';

describe('QuestionMapper', () => {
  describe('questionsFromJson', () => {
    it('retourne [] si raw n’est pas un tableau', () => {
      expect(questionsFromJson(null)).toEqual([]);
      expect(questionsFromJson(undefined)).toEqual([]);
      expect(questionsFromJson({})).toEqual([]);
      expect(questionsFromJson('hello')).toEqual([]);
    });

    it('mappe un tableau de DTO vers des Questions domaine', () => {
      const raw = [
        {
          type: TypeQuestion.CHOIX_UNIQUE,
          question: 'Q1',
          points: 1,
          options: [
            { label: 'A', isCorrect: true },
            { label: 'B', isCorrect: false },
          ],
          explication: 'E1',
        },
        {
          type: TypeQuestion.CHOIX_MULTIPLE,
          question: 'Q2',
          points: 2,
          options: [
            { label: 'A', isCorrect: true },
            { label: 'B', isCorrect: true },
            { label: 'C', isCorrect: false },
          ],
          explication: 'E2',
        },
      ];

      const result = questionsFromJson(raw);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(QuestionChoixUnique);
      expect(result[1]).toBeInstanceOf(QuestionChoixMultiple);
    });

    it('throw si un type de question est inconnu', () => {
      const raw = [
        {
          type: 'INCONNU',
          question: 'Q',
          points: 1,
          options: [],
          explication: '',
        },
      ];

      expect(() => questionsFromJson(raw)).toThrow('TypeQuestion inconnu: INCONNU');
    });
  });

  describe('questionFromDTO', () => {
    it('retourne QuestionChoixUnique si type = CHOIX_UNIQUE', () => {
      const dto = {
        type: TypeQuestion.CHOIX_UNIQUE,
        question: 'Q1',
        points: 1,
        options: [
          { label: 'A', isCorrect: true },
          { label: 'B', isCorrect: false },
        ],
        explication: 'E1',
      } as any;

      const q = questionFromDTO(dto);

      expect(q).toBeInstanceOf(QuestionChoixUnique);
    });

    it('retourne QuestionChoixMultiple si type = CHOIX_MULTIPLE', () => {
      const dto = {
        type: TypeQuestion.CHOIX_MULTIPLE,
        question: 'Q2',
        points: 2,
        options: [
          { label: 'A', isCorrect: true },
          { label: 'B', isCorrect: true }, // ✅ au moins 2 correctes
          { label: 'C', isCorrect: false },
        ],
        explication: 'E2',
      } as any;

      const q = questionFromDTO(dto);

      expect(q).toBeInstanceOf(QuestionChoixMultiple);
    });

    it('throw si type inconnu', () => {
      const dto = {
        type: 'UNKNOWN',
        question: 'Q',
        points: 1,
        options: [],
        explication: '',
      } as any;

      expect(() => questionFromDTO(dto)).toThrow('TypeQuestion inconnu: UNKNOWN');
    });
  });
});
