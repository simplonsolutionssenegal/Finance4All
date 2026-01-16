'use client';

import { useParams } from 'next/navigation';

import EditServiceComponent from '@/components/admin/institutions/EditServiceComponent';

const EditServicePage = () => {
  const params = useParams();

  // ⚠️ si ton dossier institution est [id], c'est bien params.id
  const institutionId = params.id as string;

  // ⚠️ le segment doit être [serviceId] dans le dossier
  const serviceId = params.serviceId as string;

  return <EditServiceComponent institutionId={institutionId} serviceId={serviceId} />;
};

export default EditServicePage;
