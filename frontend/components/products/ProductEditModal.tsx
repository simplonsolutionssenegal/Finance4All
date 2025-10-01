// frontend/components/products/ProductEditModal.tsx

'use client';

import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUpdateProduct } from '@/hooks/products/useProductOperations';
import type { Product } from '@/types/Product';

import { ProductFormFields } from './ProductFormFields';

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export default function ProductEditModal({ isOpen, onClose, product }: ProductEditModalProps) {
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

  const { updateProduct } = useUpdateProduct({ reloadFn: () => window.location.reload() });

  useEffect(() => {
    if (product) {
      setDesignation(product.designation);
      setType(product.type);
      setMontantMinimum(product.montantMinimum.toString());
      setMontantMaximum(product.montantMaximum.toString());
      setDureeMinimum(product.remboursement.dureeMinimum.toString());
      setDureeMaximum(product.remboursement.dureeMaximum.toString());
      setTauxInteret(product.remboursement.tauxInteret.toString());
      setTypeRemboursement(product.remboursement.typeRemboursement);
      setRemboursementAnticipe(product.remboursement.remboursementAnticipe);
      setAgeMinimum(product.conditionsEligibilite.ageMinimum.toString());
      setRevenuMinimum(product.conditionsEligibilite.revenuMinimum.toString());
    }
  }, [product]);

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
        modalites: product.remboursement.modalites,
        tauxInteret: Number(tauxInteret),
        typeRemboursement,
        remboursementAnticipe,
      },
      conditionsEligibilite: {
        ageMinimum: Number(ageMinimum),
        revenuMinimum: Number(revenuMinimum),
        situationsProfessionnelles: product.conditionsEligibilite.situationsProfessionnelles,
        documentsRequis: product.conditionsEligibilite.documentsRequis,
        autresConditions: product.conditionsEligibilite.autresConditions,
      },
    };

    await updateProduct(product.id, productData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold text-gray-900'>
            Modifier le produit
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6'>
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
            <Button type='button' variant='outline' onClick={onClose}>
              Annuler
            </Button>
            <Button type='submit' className='bg-teal-500 hover:bg-teal-600'>
              Enregistrer les modifications
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
