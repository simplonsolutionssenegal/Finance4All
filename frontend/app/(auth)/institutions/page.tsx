import InstitutionsList from '@/components/admin/institutions/InstitutionsList';
import InstitutionsStats from '@/components/admin/institutions/InstitutionsStats';
import NewInstitutionButton from '@/components/admin/institutions/NewInstitutionButton';

export default function InstitutionsPage() {
  return (
    <div className='space-y-6'>
      <div className='flex items-start justify-between'>
        <div>
          <h1 className='text-3xl md:text-[40px] font-semibold text-gray-900'>
            Gestion des institutions
          </h1>
          <p className='text-sm text-gray-500'>
            Administrez les institutions financières disponibles sur la plateforme
          </p>
        </div>

        <NewInstitutionButton />
      </div>

      <InstitutionsStats />
      <InstitutionsList />
    </div>
  );
}
