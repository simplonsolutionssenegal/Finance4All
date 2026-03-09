import { ABOUT_STATS } from '@/types/utils/about-data';

export default function AboutStats() {
  return (
    <section className='py-10 px-6 lg:px-8 bg-white'>
      <div className='max-w-7xl mx-auto'>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-10 text-center'>
          {ABOUT_STATS.map(item => (
            <div key={item.label}>
              <div className='text-4xl sm:text-5xl mb-2 text-gradient-primary font-bold'>
                {item.value}
              </div>
              <p className='text-sm text-grey-600'>{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
