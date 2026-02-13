import { DifficultyLevel, ModuleStatus } from '@/types/modules/module';
import { learningModuleService } from '@/services/learning-module.service';
import { apiClient } from '@/lib/api-client';
import { UserModuleStatus } from '@/types/learning-module';

jest.mock('@/lib/api-client');

const mockApiClient = apiClient as jest.MockedFunction<typeof apiClient>;

describe('learningModuleService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getModules', () => {
    it('retourne les modules avec lessonCount quand l’API envoie lessonCount', async () => {
      mockApiClient.mockResolvedValue({
        data: [
          {
            id: 'm1',
            title: 'Module 1',
            description: 'Desc 1',
            difficultyLevel: DifficultyLevel.BEGINNER,
            estimatedDuration: 60,
            status: ModuleStatus.PUBLISHED,
            lessonCount: 5,
            userStatus: UserModuleStatus.AVAILABLE,
            progressPercent: 0,
          },
        ],
        pagination: { total: 1, page: 1, limit: 100, totalPages: 1 },
        message: 'OK',
      });

      const result = await learningModuleService.getModules('token');

      expect(result).toHaveLength(1);
      expect(result[0].lessonCount).toBe(5);
      expect(result[0].id).toBe('m1');
      expect(result[0].title).toBe('Module 1');
      expect(mockApiClient).toHaveBeenCalledWith('modules?page=1&limit=100', 'GET', 'token');
    });

    it('dérive lessonCount depuis lessons.length quand lessonCount est absent', async () => {
      mockApiClient.mockResolvedValue({
        data: [
          {
            id: 'm2',
            title: 'Module 2',
            description: 'Desc 2',
            difficultyLevel: DifficultyLevel.INTERMEDIATE,
            estimatedDuration: 90,
            status: ModuleStatus.PUBLISHED,
            lessons: [{ id: 'l1' }, { id: 'l2' }, { id: 'l3' }],
          },
        ],
        pagination: { total: 1, page: 1, limit: 100, totalPages: 1 },
        message: 'OK',
      });

      const result = await learningModuleService.getModules(null);

      expect(result[0].lessonCount).toBe(3);
      expect(result[0].id).toBe('m2');
    });

    it('retourne lessonCount 0 quand ni lessonCount ni lessons', async () => {
      mockApiClient.mockResolvedValue({
        data: [
          {
            id: 'm3',
            title: 'Module 3',
            description: 'Desc 3',
            difficultyLevel: DifficultyLevel.BEGINNER,
            estimatedDuration: 30,
            status: ModuleStatus.PUBLISHED,
          },
        ],
        pagination: { total: 1, page: 1, limit: 100, totalPages: 1 },
        message: 'OK',
      });

      const result = await learningModuleService.getModules('token');

      expect(result[0].lessonCount).toBe(0);
    });

    it('préfère lessonCount à lessons.length quand les deux sont présents', async () => {
      mockApiClient.mockResolvedValue({
        data: [
          {
            id: 'm4',
            title: 'Module 4',
            description: 'Desc 4',
            difficultyLevel: DifficultyLevel.BEGINNER,
            estimatedDuration: 45,
            status: ModuleStatus.PUBLISHED,
            lessonCount: 10,
            lessons: [{ id: 'l1' }, { id: 'l2' }],
          },
        ],
        pagination: { total: 1, page: 1, limit: 100, totalPages: 1 },
        message: 'OK',
      });

      const result = await learningModuleService.getModules(null);

      expect(result[0].lessonCount).toBe(10);
    });

    it('mappe imageMediaId, thematics, userStatus et progressPercent', async () => {
      mockApiClient.mockResolvedValue({
        data: [
          {
            id: 'm5',
            title: 'Module 5',
            description: 'Desc 5',
            imageMediaId: 'media-1',
            difficultyLevel: DifficultyLevel.BEGINNER,
            estimatedDuration: 20,
            status: ModuleStatus.PUBLISHED,
            thematics: 'budget',
            lessonCount: 1,
            userStatus: UserModuleStatus.IN_PROGRESS,
            progressPercent: 50,
          },
        ],
        pagination: { total: 1, page: 1, limit: 100, totalPages: 1 },
        message: 'OK',
      });

      const result = await learningModuleService.getModules('token');

      expect(result[0].imageMediaId).toBe('media-1');
      expect(result[0].thematic).toBe('budget');
      expect(result[0].userStatus).toBe(UserModuleStatus.IN_PROGRESS);
      expect(result[0].progressPercent).toBe(50);
    });

    it('utilise les valeurs par défaut pour userStatus et progressPercent', async () => {
      mockApiClient.mockResolvedValue({
        data: [
          {
            id: 'm6',
            title: 'Module 6',
            description: 'Desc 6',
            difficultyLevel: DifficultyLevel.BEGINNER,
            estimatedDuration: 15,
            status: ModuleStatus.PUBLISHED,
            lessonCount: 0,
          },
        ],
        pagination: { total: 1, page: 1, limit: 100, totalPages: 1 },
        message: 'OK',
      });

      const result = await learningModuleService.getModules(null);

      expect(result[0].userStatus).toBe(UserModuleStatus.AVAILABLE);
      expect(result[0].progressPercent).toBe(0);
    });

    it('relance l’erreur si l’API échoue', async () => {
      const err = new Error('Network error');
      mockApiClient.mockRejectedValue(err);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(learningModuleService.getModules('token')).rejects.toThrow('Network error');
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching modules:', err);
      consoleSpy.mockRestore();
    });

    it('retourne un tableau vide quand data est vide', async () => {
      mockApiClient.mockResolvedValue({
        data: [],
        pagination: { total: 0, page: 1, limit: 100, totalPages: 0 },
        message: 'OK',
      });

      const result = await learningModuleService.getModules(null);

      expect(result).toEqual([]);
    });
  });
});
