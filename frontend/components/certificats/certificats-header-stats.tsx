import { Card, CardContent } from '@/components/ui/card';
import type { HeaderStatItem } from '@/types/utils/certificats-data';

type CertificatsHeaderStatsProps = {
  items: HeaderStatItem[];
};

export default function CertificatsHeaderStats({ items }: CertificatsHeaderStatsProps) {
  return (
    <section className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4'>
      {items.map(({ label, value, icon: Icon }) => (
        <Card key={label} className='border-grey-200 shadow-sm'>
          <CardContent className='p-5'>
            <div className='flex items-center gap-3'>
              <div className='size-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center'>
                <Icon className='size-5' />
              </div>
              <div>
                <p className='text-sm text-grey-600'>{label}</p>
                <p className='text-3xl font-semibold text-secondary-300 leading-tight'>{value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
