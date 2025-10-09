'use client';

import { useParams } from 'next/navigation';

import InstitutionDetailsComponent from '@/components/admin/institutions/InstitutionDetailsComponent';

const InstitutionDetailsPage = () => {
  const params = useParams();
  const institutionId = params.id as string;

  return <InstitutionDetailsComponent institutionId={institutionId} />;
};

export default InstitutionDetailsPage;
