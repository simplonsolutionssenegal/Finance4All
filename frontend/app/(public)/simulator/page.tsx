import PublicFooter from '@/components/public/layout/footer';
import { ServiceSimulator } from '@/components/service-simulator/service-simulator';

export default function ServiceSimulatorPage() {
  return (
    <div className='min-h-screen overflow-visible'>
      {/* Service Simulator */}
      <ServiceSimulator />

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
