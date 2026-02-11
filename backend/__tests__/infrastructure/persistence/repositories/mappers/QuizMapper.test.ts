import { Quiz, QuizStatus } from '@/domain/formations/entities/Quiz';
import { EntityId } from '@/domain/shared/EntityId';
import {
  QuestionChoixUnique,
  QuestionChoixMultiple,
  TypeQuestion,
} from '@/domain/formations/entities/Question';
import {
  quizFromPrisma,
  type PrismaQuizLike,
} from '@/infrastructure/persistence/repositories/mappers/QuizMapper';

describe('QuizMapper', () => {
  const makePrismaQuiz = (overrides: Partial<PrismaQuizLike> = {}): PrismaQuizLike => {
    const quizId = EntityId.generate().getValue();

    return {
      id: quizId,
      moduleId: 'module-123',
      lessonId: 'lesson-456',
      chapterId: null,
      title: 'Quiz de test',
      description: 'Description du quiz',
      status: 'DRAFT',
      scoreMinimum: 70,
      duree: 600,
      nombreTentatives: 3,
      questions: [
        {
          type: TypeQuestion.CHOIX_UNIQUE,
          question: 'Question à choix unique?',
          points: 10,
          options: [
            { label: 'Réponse A', isCorrect: true },
            { label: 'Réponse B', isCorrect: false },
          ],
          explication: 'Explication de la réponse',
        },
        {
          type: TypeQuestion.CHOIX_MULTIPLE,
          question: 'Question à choix multiples?',
          points: 20,
          options: [
            { label: 'Réponse A', isCorrect: true },
            { label: 'Réponse B', isCorrect: true },
            { label: 'Réponse C', isCorrect: false },
          ],
          explication: 'Plusieurs réponses possibles',
        },
      ],
      ...overrides,
    };
  };

  describe('quizFromPrisma', () => {
    it('devrait mapper un quiz Prisma vers une entité Domain Quiz', () => {
      const prismaQuiz = makePrismaQuiz();

      const result = quizFromPrisma(prismaQuiz);

      expect(result).toBeInstanceOf(Quiz);
      expect(result.id.getValue()).toBe(prismaQuiz.id);
      expect(result.moduleId).toBe('module-123');
      expect(result.lessonId).toBe('lesson-456');
      expect(result.chapterId).toBeUndefined();
      expect(result.title).toBe('Quiz de test');
      expect(result.description).toBe('Description du quiz');
      expect(result.status).toBe(QuizStatus.DRAFT);
      expect(result.scoreMinimum).toBe(70);
      expect(result.duree).toBe(600);
      expect(result.nombreTentatives).toBe(3);
      expect(result.questions).toHaveLength(2);
    });

    it('devrait mapper correctement les questions du quiz', () => {
      const prismaQuiz = makePrismaQuiz();

      const result = quizFromPrisma(prismaQuiz);

      // Vérifier question choix unique
      expect(result.questions[0]).toBeInstanceOf(QuestionChoixUnique);
      expect(result.questions[0].question).toBe('Question à choix unique?');
      expect(result.questions[0].points).toBe(10);

      // Vérifier question choix multiple
      expect(result.questions[1]).toBeInstanceOf(QuestionChoixMultiple);
      expect(result.questions[1].question).toBe('Question à choix multiples?');
      expect(result.questions[1].points).toBe(20);
    });

    it('devrait convertir null en undefined pour les champs optionnels', () => {
      const prismaQuiz = makePrismaQuiz({
        moduleId: null,
        lessonId: null,
        chapterId: null,
        duree: null,
      });

      const result = quizFromPrisma(prismaQuiz);

      expect(result.moduleId).toBeUndefined();
      expect(result.lessonId).toBeUndefined();
      expect(result.chapterId).toBeUndefined();
      expect(result.duree).toBeUndefined();
    });

    it('devrait gérer un quiz sans questions', () => {
      const prismaQuiz = makePrismaQuiz({ questions: [] });

      const result = quizFromPrisma(prismaQuiz);

      expect(result.questions).toHaveLength(0);
    });

    it("devrait gérer questions qui n'est pas un tableau", () => {
      const prismaQuiz = makePrismaQuiz({ questions: null });

      const result = quizFromPrisma(prismaQuiz);

      expect(result.questions).toHaveLength(0);
    });

    it('devrait gérer tous les statuts de quiz possibles', () => {
      const statuses = [QuizStatus.DRAFT, QuizStatus.PUBLISHED, QuizStatus.ARCHIVED];

      statuses.forEach(status => {
        const prismaQuiz = makePrismaQuiz({ status });
        const domainQuiz = quizFromPrisma(prismaQuiz);

        expect(domainQuiz.status).toBe(status);
      });
    });

    it('devrait gérer des valeurs limites pour scoreMinimum', () => {
      const prismaQuiz1 = makePrismaQuiz({ scoreMinimum: 0 });
      const prismaQuiz2 = makePrismaQuiz({ scoreMinimum: 100 });

      const result1 = quizFromPrisma(prismaQuiz1);
      const result2 = quizFromPrisma(prismaQuiz2);

      expect(result1.scoreMinimum).toBe(0);
      expect(result2.scoreMinimum).toBe(100);
    });

    it('devrait gérer des valeurs limites pour nombreTentatives', () => {
      const prismaQuiz1 = makePrismaQuiz({ nombreTentatives: 1 });
      const prismaQuiz2 = makePrismaQuiz({ nombreTentatives: 3 });

      const result1 = quizFromPrisma(prismaQuiz1);
      const result2 = quizFromPrisma(prismaQuiz2);

      expect(result1.nombreTentatives).toBe(1);
      expect(result2.nombreTentatives).toBe(3);
    });

    it('devrait créer un quiz avec isIllimite = true quand duree est null', () => {
      const prismaQuiz = makePrismaQuiz({ duree: null });

      const result = quizFromPrisma(prismaQuiz);

      expect(result.duree).toBeUndefined();
      expect(result.isIllimite).toBe(true);
    });

    it('devrait créer un quiz avec isIllimite = false quand duree est définie', () => {
      const prismaQuiz = makePrismaQuiz({ duree: 1200 });

      const result = quizFromPrisma(prismaQuiz);

      expect(result.duree).toBe(1200);
      expect(result.isIllimite).toBe(false);
    });

    it('devrait gérer un quiz lié uniquement à un module', () => {
      const prismaQuiz = makePrismaQuiz({
        moduleId: 'module-only',
        lessonId: null,
        chapterId: null,
      });

      const result = quizFromPrisma(prismaQuiz);

      expect(result.moduleId).toBe('module-only');
      expect(result.lessonId).toBeUndefined();
      expect(result.chapterId).toBeUndefined();
    });

    it('devrait gérer un quiz lié uniquement à une leçon', () => {
      const prismaQuiz = makePrismaQuiz({
        moduleId: null,
        lessonId: 'lesson-only',
        chapterId: null,
      });

      const result = quizFromPrisma(prismaQuiz);

      expect(result.moduleId).toBeUndefined();
      expect(result.lessonId).toBe('lesson-only');
      expect(result.chapterId).toBeUndefined();
    });

    it('devrait gérer un quiz lié uniquement à un chapitre', () => {
      const prismaQuiz = makePrismaQuiz({
        moduleId: null,
        lessonId: null,
        chapterId: 'chapter-only',
      });

      const result = quizFromPrisma(prismaQuiz);

      expect(result.moduleId).toBeUndefined();
      expect(result.lessonId).toBeUndefined();
      expect(result.chapterId).toBe('chapter-only');
    });
  });
});
