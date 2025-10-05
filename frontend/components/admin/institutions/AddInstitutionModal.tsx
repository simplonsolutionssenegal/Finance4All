'use client';

import { ImagePlus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface AddInstitutionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddInstitutionModal = ({ open, onOpenChange }: AddInstitutionModalProps) => {
  const [selectedZones, setSelectedZones] = useState<string[]>(['Zone 2', 'Zone 5']);

  const availableZones = ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5', 'Zone 6'];

  const toggleZone = (zone: string) => {
    if (selectedZones.includes(zone)) {
      setSelectedZones(selectedZones.filter(z => z !== zone));
    } else {
      setSelectedZones([...selectedZones, zone]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md bg-white'>
        <DialogHeader>
          <DialogTitle className='text-xl font-bold text-gray-900'>Ajouter un institut</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Nom de l'institut */}
          <div>
            <label className='block text-sm font-medium text-gray-900 mb-2'>
              Nom de l&apos;institut
            </label>
            <input
              type='text'
              placeholder='Société générale'
              className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>

          {/* Description */}
          <div>
            <label className='block text-sm font-medium text-gray-900 mb-2'>Description</label>
            <textarea
              rows={4}
              placeholder='Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum'
              className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
            />
          </div>

          {/* Site web */}
          <div>
            <label className='block text-sm font-medium text-gray-900 mb-2'>Site web</label>
            <input
              type='text'
              placeholder='www.institut.sn'
              className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>

          {/* Zones géographiques couvertes */}
          <div>
            <label className='block text-sm font-medium text-gray-900 mb-2'>
              Zones géographiques couvertes
            </label>
            <div className='flex flex-wrap gap-2'>
              {availableZones.map(zone => (
                <button
                  key={zone}
                  onClick={() => toggleZone(zone)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedZones.includes(zone)
                      ? 'bg-gray-200 text-gray-900'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {zone}
                </button>
              ))}
            </div>
          </div>

          {/* Logo */}
          <div>
            <label className='block text-sm font-medium text-gray-900 mb-2'>Logo</label>
            <div className='border-2 border-dashed border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors'>
              <div className='w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-2'>
                <ImagePlus className='w-6 h-6 text-gray-400' />
              </div>
              <p className='text-sm text-gray-500'>Sélectionner une image</p>
            </div>
          </div>

          {/* Bouton Enregistrer */}
          <div className='flex justify-end pt-4'>
            <Button className='bg-cyan-400 text-white hover:bg-cyan-500 px-8 py-3 rounded-xl'>
              Enregistrer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddInstitutionModal;
