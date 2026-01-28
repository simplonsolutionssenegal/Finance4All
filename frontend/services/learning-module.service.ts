import { apiClient } from '@/lib/api-client';
import { LearningModule, UserModuleStatus } from '@/types/learning-module';
import { DifficultyLevel, ModuleStatus } from '@/types/modules/module';

interface ModuleResponse {
  data: {
    id: string;
    title: string;
    description: string;
    imageMediaId?: string;
    difficultyLevel: DifficultyLevel;
    estimatedDuration: number;
    status: ModuleStatus;
    thematics?: string;
    lessonCount?: number;
    userStatus?: UserModuleStatus;
    progressPercent?: number;
  }[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
}

export const learningModuleService = {
  async getModules(token: string | null = null): Promise<LearningModule[]> {
    try {
      const response = await apiClient<ModuleResponse>('modules?page=1&limit=100', 'GET', token);

      return response.data.map(module => ({
        id: module.id,
        title: module.title,
        description: module.description,
        difficultyLevel: module.difficultyLevel,
        estimatedDuration: module.estimatedDuration,
        status: module.status,
        imageMediaId: module.imageMediaId || null,
        lessonCount: module.lessonCount ?? 0,
        userStatus: module.userStatus ?? UserModuleStatus.AVAILABLE,
        progressPercent: module.progressPercent ?? 0,
        thematic: module.thematics,
      }));
    } catch (error) {
      console.error('Error fetching modules:', error);
      throw error;
    }
  },
};
