'use client';

import { FileText, HelpCircle, Clock, Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { useState, useRef, useEffect } from 'react';

import { useMediaUrl } from '@/hooks/module/media/useMedia';
import type { Module } from '@/types/modules/module';

interface ModuleCardProps {
  module: Module;
}

export default function ModuleCard({ module }: ModuleCardProps) {
  const lessonsCount = (module as any).lessonsCount ?? (module as any).lessons?.length ?? 0;
  const quizzesCount = (module as any).quizzesCount ?? (module as any).quizzes?.length ?? 0;
  const durationRaw = (module as any).durationMinutes ?? (module as any).estimatedDuration ?? 0;

  const duration =
    typeof durationRaw === 'string'
      ? durationRaw
      : typeof durationRaw === 'number'
        ? `${durationRaw}min`
        : '—';
  const { url: imageUrl } = useMediaUrl((module as any).imageMediaId);

  return (
    <div className='bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100'>
      {/* Image */}
      <div className='relative w-full h-44 bg-gray-100'>
        {imageUrl ? (
          <Link href={`/modules/${module.id}`}>
            <Image
              src={imageUrl}
              alt={module.title}
              fill
              className='object-cover cursor-pointer'
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            />
          </Link>
        ) : (
          <div className='w-full h-full bg-gray-100' />
        )}
      </div>

      {/* Contenu */}
      <div className='p-5'>
        <div className='flex items-center gap-2 mb-3'>
          <span className='px-2 py-1 text-xs font-medium rounded-full border border-gray-200 bg-white'>
            {module.thematics}
          </span>

          <span className='inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-600'>
            <Check size={14} className='text-green-700' />
            {module.status ?? 'Publié'}
          </span>
        </div>

        <Link href={`/modules/${module.id}`}>
          <h3 className='text-lg font-medium text-gray-700 leading-snug mb-2 line-clamp-2  hover:text-primary-400 cursor-pointer'>
            {module.title}
          </h3>
        </Link>

        <p className='text-sm text-gray-600 leading-relaxed line-clamp-2 mb-4'>
          {module.description}
        </p>

        <div className='flex items-center gap-5 text-sm text-gray-600'>
          <div className='flex items-center gap-2'>
            <FileText className='w-4 h-4 text-gray-500' />
            <span className='text-gray-700 font-medium'>{lessonsCount}</span>
          </div>

          <div className='flex items-center gap-2'>
            <HelpCircle className='w-4 h-4 text-gray-500' />
            <span className='text-gray-700 font-medium'>{quizzesCount}</span>
          </div>

          <div className='flex items-center gap-2'>
            <Clock className='w-4 h-4 text-gray-500' />
            <span className='text-gray-700 font-medium'>{duration}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
