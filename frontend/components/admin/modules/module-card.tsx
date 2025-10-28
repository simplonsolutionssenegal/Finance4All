// frontend/src/components/modules/module-card.tsx

'use client';

import { Eye, Edit, Archive, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';

import {
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  THEMATIC_LABELS,
  THEMATIC_ICONS,
} from '@/lib/constants/module-constants';
import type { Module } from '@/types/modules/module';

interface ModuleCardProps {
  module: Module;
}

export default function ModuleCard({ module }: ModuleCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleMenuAction = (action: string) => {
    console.log(`Action: ${action} sur module ${module.id}`);
    setIsMenuOpen(false);
    // Ajoutez ici la logique pour chaque action
  };

  return (
    <div className='bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 group'>
      {/* Image */}
      <div className='relative h-48 w-full overflow-hidden bg-gradient-to-br from-red-100 to-pink-100'>
        {module.imageUrl ? (
          <Image
            src={module.imageUrl}
            alt={module.title}
            fill
            className='object-cover group-hover:scale-105 transition-transform duration-300'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center'>
            <span className='text-6xl opacity-50'>{THEMATIC_ICONS[module.thematics[0]]}</span>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className='p-5'>
        {/* Menu 3 points */}
        <div className='flex justify-start mb-2 '>
          <div className='relative ' ref={menuRef}>
            <button
              onClick={e => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className='p-1.5 hover:bg-gray-100 rounded-full transition-colors cursor-pointer flex items-center justify-center h-8 w-8'
            >
              <svg className='w-5 h-5 text-gray-600' fill='currentColor' viewBox='0 0 20 20'>
                <circle cx='10' cy='4' r='1.5' />
                <circle cx='10' cy='10' r='1.5' />
                <circle cx='10' cy='16' r='1.5' />
              </svg>
            </button>

            {/* Menu déroulant */}
            {isMenuOpen && (
              <div className='absolute left-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 '>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleMenuAction('voir');
                  }}
                  className='w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors'
                >
                  <Eye size={18} className='text-gray-500' />
                  Voir les détails
                </button>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleMenuAction('modifier');
                  }}
                  className='w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors'
                >
                  <Edit size={18} className='text-gray-500' />
                  Modifier
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleMenuAction('archiver');
                  }}
                  className='w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors'
                >
                  <Archive size={18} className='text-gray-500' />
                  Archiver
                </button>

                <div className='border-t border-gray-200 my-1' />

                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleMenuAction('supprimer');
                  }}
                  className='w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors'
                >
                  <Trash2 size={18} className='text-red-600' />
                  Supprimer
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Titre */}
        <h3 className='text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer'>
          {module.title}
        </h3>

        {/* Description */}
        <p className='text-sm text-gray-600 line-clamp-2 mb-4'>{module.description}</p>

        {/* Tags */}
        <div className='flex flex-wrap gap-2 mb-4'>
          <span className='px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full'>
            {THEMATIC_LABELS[module.thematics[0]]}
          </span>
          <span
            className={`px-3 py-1 text-xs font-medium rounded-full ${DIFFICULTY_COLORS[module.difficultyLevel]}`}
          >
            {DIFFICULTY_LABELS[module.difficultyLevel]}
          </span>
          <span className='px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full'>
            Publié
          </span>
        </div>

        {/* Stats - 3 colonnes */}
        <div className='grid grid-cols-3 gap-4 pt-4 border-t border-gray-100'>
          <div className='text-center'>
            <p className='text-2xl font-bold text-gray-900'>{module.estimatedDuration}</p>
            <p className='text-xs text-gray-500'>Leçons</p>
          </div>
          <div className='text-center'>
            <p className='text-2xl font-bold text-gray-900'>{module.estimatedDuration}</p>
            <p className='text-xs text-gray-500'>Quiz</p>
          </div>
          <div className='text-center'>
            <p className='text-2xl font-bold text-gray-900'>{module.estimatedDuration}</p>
            <p className='text-xs text-gray-500'>Inscrits</p>
          </div>
        </div>
      </div>
    </div>
  );
}
