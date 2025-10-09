import InstitutionsList from '@/components/admin/institutions/InstitutionsList';
import InstitutionsStats from '@/components/admin/institutions/InstitutionsStats';

const InstitutionsPage = () => {
  return (
    <div>
      <InstitutionsStats />
      <InstitutionsList />
    </div>
  );
};

export default InstitutionsPage;
