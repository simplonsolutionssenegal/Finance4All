// frontend/components/products/AddProductModal.tsx

'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { ProductFormFields } from '../../components/products/ProductFormFields';

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
          <DialogTitle className='text-xl font-semibold text-gray-900'>
            Ajouter un nouveau produit
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6' role='form'>
          <ProductFormFields
            designation={designation}
            setDesignation={setDesignation}
            type={type}
            setType={setType}
            montantMinimum={montantMinimum}
            setMontantMinimum={setMontantMinimum}
            montantMaximum={montantMaximum}
            setMontantMaximum={setMontantMaximum}
            dureeMinimum={dureeMinimum}
            setDureeMinimum={setDureeMinimum}
            dureeMaximum={dureeMaximum}
            setDureeMaximum={setDureeMaximum}
            tauxInteret={tauxInteret}
            setTauxInteret={setTauxInteret}
            typeRemboursement={typeRemboursement}
            setTypeRemboursement={setTypeRemboursement}
            remboursementAnticipe={remboursementAnticipe}
            setRemboursementAnticipe={setRemboursementAnticipe}
            ageMinimum={ageMinimum}
            setAgeMinimum={setAgeMinimum}
            revenuMinimum={revenuMinimum}
            setRevenuMinimum={setRevenuMinimum}
          />

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

// Test file: frontend/components/products/__tests__/AddProductModal.test.tsx

// eslint-disable-next-line import/order
import { render } from '@testing-library/react';

// eslint-disable-next-line import/order

describe('AddProductModal', () => {
  it('renders without crashing', () => {
    render(
      <AddProductModal
        isOpen={true}
        onClose={() => {}}
        onCreateProduct={jest.fn()}
        isCreating={false}
      />
    );
  });
});
