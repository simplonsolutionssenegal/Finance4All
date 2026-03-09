import { Card, CardContent } from '@/components/ui/card';
import { ABOUT_TIMELINE } from '@/types/utils/about-data';

export default function AboutTimeline() {
  return (
    <section className='py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 overflow-hidden'>
      <div className='max-w-5xl mx-auto'>
        <div className='text-center space-y-3 mb-12 md:mb-16'>
          <h2 className='text-3xl sm:text-4xl font-extrabold text-slate-900'>Notre Parcours</h2>
          <p className='text-slate-600 text-lg'>
            L&apos;évolution de Finance4All depuis sa création
          </p>
        </div>

        <div className='relative'>
          <div className='absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-primary-100 md:-translate-x-1/2' />

          <div className='space-y-8 md:space-y-12'>
            {ABOUT_TIMELINE.map(item => (
              <div
                key={item.year}
                className='relative flex flex-col md:flex-row items-center w-full'
              >
                <div className='absolute left-4 md:left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary-300 border-[3px] border-white shadow-sm ring-1 ring-slate-100 z-10' />

                <div
                  className={`w-full flex ${item.side === 'left' ? 'md:justify-start' : 'md:justify-end'}`}
                >
                  <div
                    className={`w-full md:w-1/2 ${
                      item.side === 'left'
                        ? 'pl-12 md:pl-0 md:pr-6 text-left md:text-right'
                        : 'pl-12 md:pl-6 text-left'
                    }`}
                  >
                    <Card className='border-slate-200 bg-white shadow-sm rounded-xl'>
                      <CardContent className='p-5 sm:p-6 md:p-8 space-y-2'>
                        <div className='text-xl md:text-2xl font-bold text-primary-300'>
                          {item.year}
                        </div>
                        <h3 className='font-bold text-base md:text-lg text-slate-900'>
                          {item.title}
                        </h3>
                        <p className='text-slate-600 leading-relaxed text-sm md:text-base'>
                          {item.desc}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
