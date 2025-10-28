// frontend/src/app/(dashboard)/modules/page.tsx

import ModulesPageContent from '@/components/admin/modules/modules-page-content';
import { getModules } from '@/lib/api/modules';

export default async function ModulesPage() {
  const modules = await getModules();
  return <ModulesPageContent initialModules={modules} />;
}
