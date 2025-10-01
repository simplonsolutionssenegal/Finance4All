// frontend/components/products/ProductFormFields.tsx

'use client';

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

interface ProductFormFieldsProps {
  designation: string;
  setDesignation: (value: string) => void;
  type: string;
  setType: (value: string) => void;
  montantMinimum: string;
  setMontantMinimum: (value: string) => void;
  montantMaximum: string;
  setMontantMaximum: (value: string) => void;
  dureeMinimum: string;
  setDureeMinimum: (value: string) => void;
  dureeMaximum: string;
  setDureeMaximum: (value: string) => void;
  tauxInteret: string;
  setTauxInteret: (value: string) => void;
  typeRemboursement: string;
  setTypeRemboursement: (value: string) => void;
  remboursementAnticipe: boolean;
  setRemboursementAnticipe: (value: boolean) => void;
  ageMinimum: string;
  setAgeMinimum: (value: string) => void;
  revenuMinimum: string;
  setRevenuMinimum: (value: string) => void;
}

export function ProductFormFields({
  designation,
  setDesignation,
  type,
  setType,
  montantMinimum,
  setMontantMinimum,
  montantMaximum,
  setMontantMaximum,
  dureeMinimum,
  setDureeMinimum,
  dureeMaximum,
  setDureeMaximum,
  tauxInteret,
  setTauxInteret,
  typeRemboursement,
  setTypeRemboursement,
  remboursementAnticipe,
  setRemboursementAnticipe,
  ageMinimum,
  setAgeMinimum,
  revenuMinimum,
  setRevenuMinimum,
}: ProductFormFieldsProps) {
  return (
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
            <Label htmlFor='tauxInteret'>Taux d&apos;intérêt (%) *</Label>
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
  );
}
