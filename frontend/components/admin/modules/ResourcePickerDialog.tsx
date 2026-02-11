'use client';

import { FileText, Image as ImageIcon, Music, Video } from 'lucide-react';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

export type ResourceKind = 'PAGE' | 'VIDEO' | 'IMAGE' | 'AUDIO' | 'PDF';

function Card({
  title,
  subtitle,
  icon,
  borderClass,
  textClass,
  onClick,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  borderClass: string;
  textClass: string;
  onClick: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`w-full rounded-2xl border-2 ${borderClass} bg-white p-5 text-left hover:shadow-sm transition`}
    >
      <div className={`mb-3 ${textClass}`}>{icon}</div>
      <div className={`text-2xl font-semibold ${textClass}`}>{title}</div>
      <div className='mt-1 text-sm text-slate-500'>{subtitle}</div>
    </button>
  );
}

export default function ResourcePickerDialog({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onPick: (kind: ResourceKind) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[640px] rounded-2xl'>
        <DialogTitle className='text-lg text-slate-900'>Créer une nouvelle ressource</DialogTitle>
        <p className='mt-1 text-sm text-slate-500'>
          Choisissez le type de contenu que vous souhaitez ajouter
        </p>

        <div className='mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4'>
          <Card
            title='Page'
            subtitle='Contenu texte et images'
            icon={<FileText className='h-8 w-8' />}
            borderClass='border-blue-200'
            textClass='text-blue-600'
            onClick={() => onPick('PAGE')}
          />
          <Card
            title='Vidéo'
            subtitle='Fichier vidéo'
            icon={<Video className='h-8 w-8' />}
            borderClass='border-purple-200'
            textClass='text-purple-600'
            onClick={() => onPick('VIDEO')}
          />
          <Card
            title='Image'
            subtitle='Image ou infographie'
            icon={<ImageIcon className='h-8 w-8' />}
            borderClass='border-green-200'
            textClass='text-green-600'
            onClick={() => onPick('IMAGE')}
          />
          <Card
            title='Audio'
            subtitle='Fichier audio ou podcast'
            icon={<Music className='h-8 w-8' />}
            borderClass='border-pink-200'
            textClass='text-pink-600'
            onClick={() => onPick('AUDIO')}
          />
          <Card
            title='PDF'
            subtitle='Document PDF'
            icon={<FileText className='h-8 w-8' />}
            borderClass='border-red-200'
            textClass='text-red-600'
            onClick={() => onPick('PDF')}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
