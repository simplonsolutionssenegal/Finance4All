import { CalendarDays, Download, GraduationCap, Share2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { CertificateItem, CertificateLevel } from '@/types/utils/certificats-data';

type CertificateCardProps = {
  certificate: CertificateItem;
};

const levelClasses: Record<CertificateLevel, string> = {
  Excellence: 'bg-primary-50 text-primary-700',
  'Tres Bien': 'bg-success-100 text-success-700',
};

export default function CertificateCard({ certificate }: CertificateCardProps) {
  return (
    <Card className='overflow-hidden border-grey-200 py-0 gap-0'>
      <div className='relative bg-gradient-primary p-5 text-white'>
        <div className='absolute top-0 right-0 size-20 rounded-full bg-white/10 -translate-y-1/3 translate-x-1/3' />
        <div className='size-10 rounded-xl bg-white/20 flex items-center justify-center mb-4 relative z-10'>
          <GraduationCap className='size-5' />
        </div>
        <h2 className='text-2xl font-bold leading-tight relative z-10'>{certificate.title}</h2>
        <p className='text-sm text-white/85 mt-1 relative z-10'>{certificate.subtitle}</p>
      </div>

      <CardContent className='p-5 space-y-4'>
        <div className='flex items-center justify-between text-sm'>
          <div className='flex items-center gap-2 text-grey-600'>
            <CalendarDays className='size-4' />
            <span>{certificate.date}</span>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${levelClasses[certificate.level]}`}
          >
            {certificate.level}
          </span>
        </div>

        <div className='rounded-xl bg-gray-100/80 p-4'>
          <p className='text-sm text-grey-600 mb-1'>Score obtenu</p>
          <p className='text-4xl font-bold text-secondary-300 leading-none'>
            {certificate.score}/100
          </p>
        </div>

        <div className='flex items-center gap-2'>
          <Button className='flex-1 cursor-pointer bg-primary-400 hover:bg-primary-400/90 text-white'>
            <Download className='size-4' />
            Telecharger
          </Button>
          <Button
            variant='outline'
            size='icon'
            className='border-grey-200 cursor-pointer text-grey-700 hover:bg-grey-50'
          >
            <Share2 className='size-4' />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
