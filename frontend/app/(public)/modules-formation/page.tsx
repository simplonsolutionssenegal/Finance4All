import { learningModuleService } from '@/services/learning-module.service';
import type { LearningModule } from '@/types/learning-module';

import { ModulesClient } from './modules-client';

export const metadata = {
  title: 'Modules de Formation - Finance4All',
  description:
    "Découvrez des modules d'éducation financière conçus spécifiquement pour l'Afrique francophone.",
};

export default async function ModulesFormationPage() {
  let initialModules: LearningModule[] = [];

  try {
    initialModules = await learningModuleService.getModules();
  } catch (error) {
    console.error('Failed to fetch modules:', error);
    // Ignore error to fallback to MOCK_MODULES in client
  }

  return <ModulesClient initialModules={initialModules} />;
}
