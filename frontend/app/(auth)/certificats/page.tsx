import CertificateCard from '@/components/certificats/certificate-card';
import CertificatsHeaderStats from '@/components/certificats/certificats-header-stats';
import { CERTIFICAT_HEADER_STATS, CERTIFICATS_MOCK } from '@/types/utils/certificats-data';

export default function CertificatsPage() {
  return (
    <div className='space-y-6'>
      <header>
        <h1 className='text-3xl font-bold text-secondary-300'>Mes Certificats</h1>
        <p className='text-grey-600 mt-1'>Vos reussites et accomplissements</p>
      </header>

      <CertificatsHeaderStats items={CERTIFICAT_HEADER_STATS} />

      <section className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5'>
        {CERTIFICATS_MOCK.map(certificate => (
          <CertificateCard key={certificate.id} certificate={certificate} />
        ))}
      </section>
    </div>
  );
}
