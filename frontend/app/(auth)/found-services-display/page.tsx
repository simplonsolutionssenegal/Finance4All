import { ServicesDashboard } from '@/components/services-financiers/ServicesDashboard';

const FoundServicesDisplay = () => {
  return (
    <div className='min-h-full bg-gray-50'>
      <div className='space-y-6'>
        <ServicesDashboard />
      </div>
    </div>
  );
};

export default FoundServicesDisplay;
