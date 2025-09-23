import BarChart from '@/components/dashboard/BarChart';
import DonutChart from '@/components/dashboard/DonutChart';
import GrowthChart from '@/components/dashboard/GrowthChart';
import InstitutionsList from '@/components/dashboard/InstitutionsList';
import StatsCards from '@/components/dashboard/StatsCards';

export default function Dashboard() {
  return (
    <div className='min-h-full bg-gray-50'>
      <div className='space-y-6'>
        <StatsCards />

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <GrowthChart />
          <DonutChart />
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <BarChart />
          <InstitutionsList />
        </div>
      </div>
    </div>
  );
}
