import InstitutionsList from '@/components/admin/institutions/InstitutionsList';
import InstitutionsStats from '@/components/admin/institutions/InstitutionsStats';
import NewInstitutionButton from '@/components/admin/institutions/NewInstitutionButton';

export default function InstitutionsPage() {
  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-6xl text-tertiary-400 tracking-tight leading-tight mb-1'>
            Gestion des institutions
          </h1>
          <p className='text-lg text-tertiary-400/60 text-muted-foreground font-normal tracking-normal'>
            Administrez les institutions financières disponibles sur la plateforme
          </p>
        </div>

        <div className='flex-shrink-0 ml-6'>
          <NewInstitutionButton />
        </div>
      </div>

      {/* Stats Cards */}
      <InstitutionsStats />

      {/* Table */}
      <InstitutionsList />
    </div>
  );
}
