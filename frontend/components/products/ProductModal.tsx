// frontend/components/products/ProductModal.tsx
'use client';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUpdateProduct } from '@/hooks/products/useProductOperations';
import type { Product } from '@/types/Product';

import { ProductFormFields } from './ProductFormFields';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  product?: Product;
  onCreateProduct?: (productData: any) => Promise<void>;
  isCreating?: boolean;
}

export default function ProductModal({
  isOpen,
  onClose,
  mode,
  product,
  onCreateProduct,
  isCreating = false,
}: ProductModalProps) {
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

  const { updateProduct } = useUpdateProduct({
    reloadFn: () => window.location.reload(),
  });

  // Initialiser les valeurs en mode édition
  useEffect(() => {
    if (mode === 'edit' && product) {
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
  }, [mode, product]);

  // Réinitialiser le formulaire en mode création
  const resetForm = () => {
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
        modalites: mode === 'edit' && product ? product.remboursement.modalites : ['mensuel'],
        tauxInteret: Number(tauxInteret),
        typeRemboursement,
        remboursementAnticipe,
      },
      conditionsEligibilite: {
        ageMinimum: Number(ageMinimum),
        revenuMinimum: Number(revenuMinimum),
        situationsProfessionnelles:
          mode === 'edit' && product
            ? product.conditionsEligibilite.situationsProfessionnelles
            : ['CDI'],
        documentsRequis:
          mode === 'edit' && product
            ? product.conditionsEligibilite.documentsRequis
            : ['Pièce identité'],
        autresConditions:
          mode === 'edit' && product ? product.conditionsEligibilite.autresConditions : [],
      },
    };

    if (mode === 'create' && onCreateProduct) {
      await onCreateProduct(productData);
      resetForm();
    } else if (mode === 'edit' && product) {
      await updateProduct(product.id, productData);
    }

    onClose();
  };

  const title = mode === 'create' ? 'Ajouter un nouveau produit' : 'Modifier le produit';

  const submitText =
    mode === 'create'
      ? isCreating
        ? 'Création...'
        : 'Créer le produit'
      : 'Enregistrer les modifications';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold text-gray-900'>{title}</DialogTitle>
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
            <Button type='button' variant='outline' onClick={onClose} disabled={isCreating}>
              Annuler
            </Button>
            <Button type='submit' className='bg-teal-500 hover:bg-teal-600' disabled={isCreating}>
              {submitText}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
