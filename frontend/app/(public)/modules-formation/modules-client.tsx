'use client';

import { Search, Star, ArrowRight, CheckCircle2, Library, GraduationCap } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import MOCK_MODULES from '@/mocks/modules-data-mock';
import type { LearningModule } from '@/types/learning-module';

import { ModuleCardClient } from './module-card';

export function ModulesClient({ initialModules }: { initialModules: LearningModule[] }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');

  const displayModules = initialModules.length > 0 ? initialModules : MOCK_MODULES;

  const filteredModules = displayModules.filter(mod => {
    if (
      search &&
      !mod.title.toLowerCase().includes(search.toLowerCase()) &&
      !mod.description.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (category !== 'all' && mod.thematic !== category) return false;
    if (difficulty !== 'all' && mod.difficultyLevel !== difficulty) return false;
    return true;
  });

  return (
    <div className='flex flex-col min-h-screen bg-white font-sans mt-[5%]'>
      <section className='relative bg-white pt-24 pb-20 px-4 overflow-hidden'>
        <div className='relative max-w-4xl mx-auto text-center z-10'>
          <h1 className='text-[44px] md:text-[56px] font-medium text-slate-700 mb-6 tracking-tight leading-[1.15]'>
            Votre parcours vers <br className='hidden md:block' />
            <span className='text-primary-300'>l&apos;excellence financière</span>
          </h1>
          <p className='text-[#9BA3AF] text-lg mb-14 max-w-2xl mx-auto leading-relaxed font-normal'>
            Découvrez des modules d&apos;éducation financière conçus
            <br className='hidden md:block' />
            spécifiquement pour l&apos;Afrique francophone. Apprenez, progressez
            <br className='hidden md:block' />
            et transformez votre avenir financier.
          </p>

          <div className='flex flex-wrap justify-center gap-6'>
            <div className='bg-white border border-slate-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-[20px] py-6 px-10 flex flex-col items-center min-w-[160px]'>
              <Library className='w-6 h-6 text-[#64B5F6] mb-3 stroke-[1.5]' />
              <span className='text-2xl font-medium text-slate-700 mb-1'>12</span>
              <span className='text-[#9BA3AF] text-[11px] font-medium capitalize'>Modules</span>
            </div>
            <div className='bg-white border border-slate-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-[20px] py-6 px-10 flex flex-col items-center min-w-[160px]'>
              <GraduationCap className='w-6 h-6 text-[#64B5F6] mb-3 stroke-[1.5]' />
              <span className='text-2xl font-medium text-slate-700 mb-1'>1000+</span>
              <span className='text-[#9BA3AF] text-[11px] font-medium capitalize'>Apprenants</span>
            </div>
            <div className='bg-white border border-slate-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-[20px] py-6 px-10 flex flex-col items-center min-w-[160px]'>
              <Star className='w-6 h-6 text-orange-300 mb-3 stroke-[1.5]' />
              <span className='text-2xl font-medium text-slate-700 mb-1'>95%</span>
              <span className='text-[#9BA3AF] text-[11px] font-medium capitalize'>
                Satisfaction
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className='max-w-7xl mx-auto px-4 py-8 w-full bg-white'>
        <div className='bg-white p-4 md:p-6 rounded-2xl shadow-lg border border-slate-200 mb-8 space-y-4'>
          <div className='relative'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5' />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Rechercher un module par titre ou description...'
              className='pl-12 py-6 bg-slate-50 border-slate-200 rounded-xl text-md'
            />
          </div>
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='flex-1 space-y-1.5'>
              <label className='text-xs font-medium text-slate-500 flex items-center gap-1.5 ml-1'>
                Catégorie
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className='w-full bg-slate-50 border-slate-200 rounded-xl h-12'>
                  <SelectValue placeholder='Toutes les catégories' />
                </SelectTrigger>
                <SelectContent className='bg-white border-none'>
                  <SelectItem value='all'>Toutes les catégories</SelectItem>
                  <SelectItem value='Finance Personnelle'>Finance Personnelle</SelectItem>
                  <SelectItem value='Investissement'>Investissement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='flex-1 space-y-1.5'>
              <label className='text-xs font-medium text-slate-500 flex items-center gap-1.5 ml-1'>
                Niveau de difficulté
              </label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className='w-full bg-slate-50 border-slate-200 rounded-xl h-12'>
                  <SelectValue placeholder='Tous les niveaux' />
                </SelectTrigger>
                <SelectContent className='bg-white border-none'>
                  <SelectItem value='all'>Tous les niveaux</SelectItem>
                  <SelectItem value='BEGINNER'>Débutant</SelectItem>
                  <SelectItem value='INTERMEDIATE'>Intermédiaire</SelectItem>
                  <SelectItem value='ADVANCED'>Avancé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className='text-sm text-primary pt-2 font-medium'>
            {filteredModules.length} modules correspondent à votre recherche
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredModules.map(module => (
            <ModuleCardClient
              key={module.id}
              module={
                module as LearningModule & {
                  durationStr: string;
                  inscrits: number;
                  reussite: number;
                }
              }
            />
          ))}
        </div>
      </section>

      <section className='max-w-7xl mx-auto px-4 py-16 mb-16 w-full'>
        <div className='bg-gradient-to-br from-primary-50 to-white shadow-sm rounded-xl p-10 flex flex-col items-center text-center'>
          {/* L'icône centrale */}
          <div className='bg-primary-100/50 w-16 h-16 flex items-center justify-center rounded-2xl mb-6'>
            <GraduationCap className='w-8 h-8 text-primary-300' />
          </div>

          {/* Les textes */}
          <h2 className='text-3xl md:text-4xl text-slate-800 mb-4'>
            Prêt à transformer votre avenir ?
          </h2>
          <p className='text-slate-500 mb-8 max-w-xl text-lg'>
            Rejoignez des milliers d&apos;apprenants et accédez gratuitement à tous nos modules
            d&apos;éducation financière de qualité
          </p>

          {/* Les boutons */}
          <div className='flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-10'>
            <Button
              size='lg'
              className='bg-primary-300 cursor-pointer hover:bg-primary-400 text-white rounded-full px-8 h-12 border-0'
            >
              <Star className='w-4 h-4 mr-2' />
              Créer un compte gratuit
              <ArrowRight className='w-4 h-4 ml-2' />
            </Button>
            <Button
              size='lg'
              variant='outline'
              className='bg-white cursor-pointer rounded-full px-8 h-12 border-slate-100 shadow-sm text-slate-700 hover:bg-slate-50'
            >
              J&apos;ai déjà un compte
            </Button>
          </div>

          {/* Les points de réassurance */}
          <div className='flex flex-wrap justify-center gap-8 text-sm font-medium text-slate-400'>
            <div className='flex items-center gap-2'>
              <CheckCircle2 className='w-5 h-5 text-green-500' /> 100% Gratuit
            </div>
            <div className='flex items-center gap-2'>
              <CheckCircle2 className='w-5 h-5 text-green-500' /> Certificats reconnus
            </div>
            <div className='flex items-center gap-2'>
              <CheckCircle2 className='w-5 h-5 text-green-500' /> Support 24/7
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
