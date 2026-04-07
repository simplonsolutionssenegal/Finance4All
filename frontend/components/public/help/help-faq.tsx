'use client';

import { BookOpen, CreditCard, Settings, Shield, Users } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { FAQ_CATEGORIES } from '@/types/utils/faq/faq.categories';
import { HELP_FAQ_ITEMS } from '@/types/utils/faq/faq.index';
import type { HelpFaqCategory } from '@/types/utils/faq/faq.type';

type HelpFaqProps = {
  query: string;
};

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

const CATEGORY_ICON: Record<
  HelpFaqCategory,
  React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
> = {
  'Modules et Apprentissage': BookOpen,
  'Pour les Organisations': Settings,
  'Compte et Inscription': Users,
  'Facturation et Paiement': CreditCard,
  'Sécurité et Confidentialité': Shield,
};

export default function HelpFaq({ query }: HelpFaqProps) {
  const filteredItems = useMemo(() => {
    const q = normalize(query);
    if (!q) return HELP_FAQ_ITEMS;

    return HELP_FAQ_ITEMS.filter(item => {
      const hay = normalize(
        [item.question, item.answer, ...(item.tags ?? []), item.category].join(' ')
      );
      return hay.includes(q);
    });
  }, [query]);

  const grouped = useMemo(() => {
    const map = new Map<HelpFaqCategory, (typeof HELP_FAQ_ITEMS)[number][]>();
    for (const item of filteredItems) {
      const arr = map.get(item.category) ?? [];
      arr.push(item);
      map.set(item.category, arr);
    }
    return map;
  }, [filteredItems]);

  return (
    <section className='py-14 px-6 lg:px-8 bg-gray-50'>
      <div className='max-w-5xl mx-auto'>
        <div className='text-center space-y-3 mb-10'>
          <h2 className='text-3xl sm:text-4xl font-bold text-grey-900'>Questions fréquentes</h2>
          <p className='text-grey-600'>Les réponses aux questions les plus courantes</p>
        </div>

        <div className='space-y-6 lg:px-20'>
          {Object.values(FAQ_CATEGORIES).map(category => {
            const items = grouped.get(category) ?? [];
            const Icon = CATEGORY_ICON[category];

            if (items.length === 0) return null;

            return (
              <Card key={category} className='border-grey-200 rounded-2xl overflow-hidden bg-white'>
                <div className='px-6 sm:px-7 flex items-center gap-4 bg-gray-50 py-4 border-b border-gray-200'>
                  <div className='w-11 h-11 bg-primary-50 rounded-2xl flex items-center justify-center shrink-0'>
                    <Icon className='w-5 h-5 text-primary-600' aria-hidden />
                  </div>
                  <div className='leading-tight'>
                    <p className='text-lg font-semibold text-grey-900'>{category}</p>
                    <p className='text-sm text-grey-600'>
                      {items.length} question{items.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <CardContent className='px-6 sm:px-7'>
                  <Accordion type='single' collapsible className='w-full space-y-4'>
                    {items.map(item => (
                      <AccordionItem key={item.id} value={item.id} className='border-0'>
                        <AccordionTrigger className='px-5 py-4 rounded-xl border border-grey-200 bg-white hover:bg-grey-50 hover:no-underline'>
                          <span className='text-sm sm:text-base text-grey-900 font-medium'>
                            {item.question}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className='px-5 text-grey-600 leading-relaxed'>
                          {item.answer}{' '}
                          {item.category === 'Sécurité et Confidentialité' && (
                            <span>
                              Voir aussi{' '}
                              <Link href='/privacy' className='text-primary-400 hover:underline'>
                                Confidentialité
                              </Link>
                              .
                            </span>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            );
          })}

          {filteredItems.length === 0 && (
            <div className='text-center py-10'>
              <p className='text-grey-900 font-semibold'>Aucun résultat</p>
              <p className='text-grey-600 mt-1'>
                Essayez avec un autre mot-clé, ou contactez notre support.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
