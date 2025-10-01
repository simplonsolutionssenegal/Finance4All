// frontend/components/products/ProductInfoModal.tsx
'use client';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Product } from '@/types/Product';

interface ProductInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export default function ProductInfoModal({ isOpen, onClose, product }: ProductInfoModalProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <div className='flex items-center justify-between'>
            <DialogTitle className='text-xl font-semibold text-gray-900'>
              Produit financier - Détail
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* Désignation */}
          <div>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>{product.designation}</h3>
          </div>

          {/* Type de produit */}
          <div className='space-y-2'>
            <h4 className='text-sm font-medium text-gray-600'>Type de produit</h4>
            <div>
              <Badge variant='secondary' className='capitalize text-base px-3 py-1'>
                {product.type}
              </Badge>
            </div>
          </div>

          {/* Montant Min et Max */}
          <div className='space-y-2'>
            <h4 className='text-sm font-medium text-gray-600'>Montant</h4>
            <div className='flex items-center gap-4'>
              <div className='flex-1 bg-gray-50 p-3 rounded-lg'>
                <p className='text-xs text-gray-500 mb-1'>Minimum</p>
                <p className='text-lg font-semibold text-gray-900'>
                  {formatCurrency(product.montantMinimum)}
                </p>
              </div>
              <div className='flex-1 bg-gray-50 p-3 rounded-lg'>
                <p className='text-xs text-gray-500 mb-1'>Maximum</p>
                <p className='text-lg font-semibold text-gray-900'>
                  {formatCurrency(product.montantMaximum)}
                </p>
              </div>
            </div>
          </div>

          {/* Conditions d'éligibilité */}
          {/* <div className='space-y-2'>
            <h4 className='text-sm font-medium text-gray-600'>Conditions d&apos;éligibilité</h4>
            <div className='bg-gray-50 p-4 rounded-lg space-y-2'>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Âge minimum:</span>
                <span className='text-sm font-medium text-gray-900'>
                  {product.conditionsEligibilite.ageMinimum} ans
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Revenu minimum:</span>
                <span className='text-sm font-medium text-gray-900'>
                  {formatCurrency(product.conditionsEligibilite.revenuMinimum)}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Situations acceptées:</span>
                <span className='text-sm font-medium text-gray-900'>
                  {product.conditionsEligibilite.situationsProfessionnelles.join(', ')}
                </span>
              </div>
            </div>
          </div> */}

          {/* Modalités de remboursement */}
          <div className='space-y-2'>
            <h4 className='text-sm font-medium text-gray-600'>Modalités de remboursement</h4>
            <div className='bg-gray-50 p-4 rounded-lg space-y-2'>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Durée:</span>
                <span className='text-sm font-medium text-gray-900'>
                  {product.remboursement.dureeMinimum} - {product.remboursement.dureeMaximum} mois
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Taux d&apos;intérêt:</span>
                <span className='text-sm font-medium text-green-700'>
                  {product.remboursement.tauxInteret}%
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Type:</span>
                <span className='text-sm font-medium text-gray-900 capitalize'>
                  {product.remboursement.typeRemboursement}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Remboursement anticipé:</span>
                <Badge
                  variant={product.remboursement.remboursementAnticipe ? 'default' : 'secondary'}
                  className={product.remboursement.remboursementAnticipe ? 'bg-green-600' : ''}
                >
                  {product.remboursement.remboursementAnticipe ? 'Autorisé' : 'Non autorisé'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {/* <div className='flex justify-end gap-3 pt-4 border-t'>
          <Button variant='outline' onClick={onClose}>
            Fermer
          </Button>
          <Button variant='destructive' onClick={onDelete}>
            Supprimer
          </Button>
        </div> */}
      </DialogContent>
    </Dialog>
  );
}
