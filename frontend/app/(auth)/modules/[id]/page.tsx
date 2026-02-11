'use client';

import { useParams } from 'next/navigation';

import ModuleDetailsComponent from '@/components/admin/modules/moduleDetailsComponent';

const ModuleDetailsPage = () => {
  const params = useParams();
  const moduleId = params.id as string;

  return <ModuleDetailsComponent moduleId={moduleId} />;
};

export default ModuleDetailsPage;
