import { Card, CardContent } from '@/components/ui/card';
import { ABOUT_VALUES } from '@/types/utils/about-data';

export default function AboutValues() {
  return (
    <section className='py-16 md:py-20 px-6 lg:px-8 bg-white'>
      <div className='max-w-7xl mx-auto'>
        <div className='text-center space-y-3 mb-10'>
          <h2 className='text-3xl sm:text-4xl font-bold text-grey-900'>Nos Valeurs</h2>
          <p className='text-grey-600'>Les principes qui guident notre mission quotidienne</p>
        </div>

        <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-6'>
          {ABOUT_VALUES.map(v => (
            <Card
              key={v.title}
              className='border-grey-200 hover:shadow-lg transition-all duration-300'
            >
              <CardContent className='p-7 space-y-4'>
                <div className='w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center'>
                  <v.icon className='w-6 h-6 text-primary-600' aria-hidden='true' />
                </div>
                <div className='space-y-2'>
                  <h3 className='font-semibold text-grey-900'>{v.title}</h3>
                  <p className='text-sm text-grey-600 leading-relaxed'>{v.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
