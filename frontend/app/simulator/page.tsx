import PublicFooter from '@/components/public/layout/footer';
import PublicHeader from '@/components/public/layout/header';
import { ServiceSimulator } from '@/components/service-simulator/service-simulator';

export default function ServiceSimulatorPage() {
  return (
    <div className='min-h-screen overflow-visible'>
      {/* Header */}
      <PublicHeader />

      {/* Service Simulator */}
      <ServiceSimulator />

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
