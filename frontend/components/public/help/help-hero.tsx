'use client';

import { CircleHelp, Search } from 'lucide-react';

import { Input } from '@/components/ui/input';

type HelpHeroProps = {
  query: string;
  onQueryChange: (v: string) => void;
};

export default function HelpHero({ query, onQueryChange }: HelpHeroProps) {
  return (
    <section className='pt-28 pb-12 px-6 lg:px-8 bg-gray-50'>
      <div className='max-w-5xl mx-auto text-center'>
        <div className='flex items-center justify-center'>
          <CircleHelp className='w-10 h-10 text-primary-300' aria-hidden='true' />
        </div>

        <h1 className='mt-6 text-4xl font-bold sm:text-5xl text-grey-900 leading-tight'>
          Centre d&apos;aide
        </h1>
        <p className='mt-3 text-base sm:text-lg text-grey-600 leading-relaxed max-w-2xl mx-auto'>
          Trouvez rapidement des réponses à vos questions ou contactez notre équipe de support
        </p>

        <div className='mt-7 max-w-2xl mx-auto'>
          <div className='relative'>
            <Search
              className='w-4 h-4 text-grey-400 absolute left-4 top-1/2 -translate-y-1/2'
              aria-hidden='true'
            />
            <Input
              value={query}
              onChange={e => onQueryChange(e.target.value)}
              placeholder="Rechercher dans l'aide..."
              className='h-12 pl-11 pr-4 bg-white border-grey-200 rounded-full focus-visible:ring-primary-300'
              aria-label="Rechercher dans l'aide"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
