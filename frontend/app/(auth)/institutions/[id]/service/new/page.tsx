'use client';

import { useParams } from 'next/navigation';

import NewServiceComponent from '@/components/admin/institutions/NewServiceComponent';

const NewServicePage = () => {
  const params = useParams();
  const institutionId = params.id as string;

  return <NewServiceComponent institutionId={institutionId} />;
};

export default NewServicePage;
