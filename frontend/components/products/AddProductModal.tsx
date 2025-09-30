// frontend/components/products/AddProductModal.tsx

'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProduct: (productData: {
    designation: string;
    type: string;
    montantMinimum: number;
    montantMaximum: number;
    remboursement: {
      dureeMinimum: number;
      dureeMaximum: number;
      modalites: string[];
      tauxInteret: number;
      typeRemboursement: string;
      remboursementAnticipe: boolean;
    };
    conditionsEligibilite: {
      ageMinimum: number;
      revenuMinimum: number;
      situationsProfessionnelles: string[];
      documentsRequis: string[];
      autresConditions: string[];
    };
  }) => Promise<void>;
  isCreating: boolean;
}

export default function AddProductModal({
  isOpen,
  onClose,
  onCreateProduct,
  isCreating,
}: AddProductModalProps) {
  const [designation, setDesignation] = useState('');
  const [type, setType] = useState('credit');
  const [montantMinimum, setMontantMinimum] = useState('');
  const [montantMaximum, setMontantMaximum] = useState('');
  const [dureeMinimum, setDureeMinimum] = useState('');
  const [dureeMaximum, setDureeMaximum] = useState('');
  const [tauxInteret, setTauxInteret] = useState('');
  const [typeRemboursement, setTypeRemboursement] = useState('fixe');
  const [remboursementAnticipe, setRemboursementAnticipe] = useState(true);
  const [ageMinimum, setAgeMinimum] = useState('');
  const [revenuMinimum, setRevenuMinimum] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !designation ||
      !montantMinimum ||
      !montantMaximum ||
      !dureeMinimum ||
      !dureeMaximum ||
      !tauxInteret ||
      !ageMinimum ||
      !revenuMinimum
    ) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const productData = {
      designation,
      type,
      montantMinimum: Number(montantMinimum),
      montantMaximum: Number(montantMaximum),
      remboursement: {
        dureeMinimum: Number(dureeMinimum),
        dureeMaximum: Number(dureeMaximum),
        modalites: ['mensuel'],
        tauxInteret: Number(tauxInteret),
        typeRemboursement,
        remboursementAnticipe,
      },
      conditionsEligibilite: {
        ageMinimum: Number(ageMinimum),
        revenuMinimum: Number(revenuMinimum),
        situationsProfessionnelles: ['CDI'],
        documentsRequis: ['Pièce identité'],
        autresConditions: [],
      },
    };

    await onCreateProduct(productData);

    // Reset form
    setDesignation('');
    setType('credit');
    setMontantMinimum('');
    setMontantMaximum('');
    setDureeMinimum('');
    setDureeMaximum('');
    setTauxInteret('');
    setTypeRemboursement('fixe');
    setRemboursementAnticipe(true);
    setAgeMinimum('');
    setRevenuMinimum('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <div className='flex items-center justify-between'>
            <DialogTitle className='text-xl font-semibold text-gray-900'>
              Ajouter un nouveau produit
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6' role='form'>
          <Tabs defaultValue='general' className='w-full'>
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='general'>Informations générales</TabsTrigger>
              <TabsTrigger value='remboursement'>Remboursement</TabsTrigger>
              <TabsTrigger value='eligibilite'>Éligibilité</TabsTrigger>
            </TabsList>

            <TabsContent value='general' className='space-y-4 mt-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='designation'>Désignation *</Label>
                  <Input
                    id='designation'
                    value={designation}
                    onChange={e => setDesignation(e.target.value)}
                    placeholder='Ex: Crédit Auto Premium'
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='type'>Type de produit *</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='credit'>Crédit</SelectItem>
                      <SelectItem value='loan'>Prêt</SelectItem>
                      <SelectItem value='insurance'>Assurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='montantMinimum'>Montant minimum (€) *</Label>
                  <Input
                    id='montantMinimum'
                    type='number'
                    value={montantMinimum}
                    onChange={e => setMontantMinimum(e.target.value)}
                    placeholder='5000'
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='montantMaximum'>Montant maximum (€) *</Label>
                  <Input
                    id='montantMaximum'
                    type='number'
                    value={montantMaximum}
                    onChange={e => setMontantMaximum(e.target.value)}
                    placeholder='50000'
                    required
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value='remboursement' className='space-y-4 mt-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='dureeMinimum'>Durée minimum (mois) *</Label>
                  <Input
                    id='dureeMinimum'
                    type='number'
                    value={dureeMinimum}
                    onChange={e => setDureeMinimum(e.target.value)}
                    placeholder='12'
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='dureeMaximum'>Durée maximum (mois) *</Label>
                  <Input
                    id='dureeMaximum'
                    type='number'
                    value={dureeMaximum}
                    onChange={e => setDureeMaximum(e.target.value)}
                    placeholder='60'
                    required
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='tauxInteret'>Taux intérêt (%) *</Label>
                  <Input
                    id='tauxInteret'
                    type='number'
                    step='0.01'
                    value={tauxInteret}
                    onChange={e => setTauxInteret(e.target.value)}
                    placeholder='4.8'
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='typeRemboursement'>Type de remboursement *</Label>
                  <Select value={typeRemboursement} onValueChange={setTypeRemboursement}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='fixe'>Fixe</SelectItem>
                      <SelectItem value='variable'>Variable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='flex items-center space-x-2'>
                <Switch
                  id='remboursementAnticipe'
                  checked={remboursementAnticipe}
                  onCheckedChange={setRemboursementAnticipe}
                />
                <Label htmlFor='remboursementAnticipe'>Autoriser le remboursement anticipé</Label>
              </div>
            </TabsContent>

            <TabsContent value='eligibilite' className='space-y-4 mt-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='ageMinimum'>Âge minimum *</Label>
                  <Input
                    id='ageMinimum'
                    type='number'
                    value={ageMinimum}
                    onChange={e => setAgeMinimum(e.target.value)}
                    placeholder='18'
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='revenuMinimum'>Revenu minimum (€) *</Label>
                  <Input
                    id='revenuMinimum'
                    type='number'
                    value={revenuMinimum}
                    onChange={e => setRevenuMinimum(e.target.value)}
                    placeholder='1800'
                    required
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className='flex justify-end gap-3 pt-4 border-t'>
            <Button type='button' variant='outline' onClick={onClose} disabled={isCreating}>
              Annuler
            </Button>
            <Button type='submit' className='bg-teal-500 hover:bg-teal-600' disabled={isCreating}>
              {isCreating ? 'Création...' : 'Créer le produit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
