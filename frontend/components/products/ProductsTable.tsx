// frontend/components/products/ProductsTable.tsx
'use client';
import { Search, Eye } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

import ProductInfoModal from '@/components/products/ProductInfoModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ProductsAPI } from '@/lib/api/products';
import type { Product } from '@/types/Product';

export default function ProductsTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductInfo, setShowProductInfo] = useState(false);

  // Fonction pour charger les produits
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ProductsAPI.getAllProducts(1, 100);
      setProducts(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les produits au montage
  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = products.filter(
    product =>
      product.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowProductInfo(true);
  };

  const handleCloseModals = () => {
    setShowProductInfo(false);
    setSelectedProduct(null);
  };

  const renderModals = () => {
    return (
      <>
        {selectedProduct && (
          <>
            <ProductInfoModal
              isOpen={showProductInfo}
              onClose={handleCloseModals}
              product={selectedProduct}
            />
          </>
        )}
      </>
    );
  };

  return (
    <Card className='bg-white shadow-sm border border-gray-100 rounded-2xl'>
      <CardHeader className='pb-4'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-xl font-semibold text-gray-900'>Produits Financier</CardTitle>
        </div>
        <div className='mt-4'>
          <div className='relative max-w-md'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
            <Input
              type='text'
              placeholder='Rechercher un produit...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-10 pr-4 py-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent'
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className='pb-6'>
        {loading ? (
          <div className='flex flex-col items-center justify-center py-8 space-y-2'>
            <div className='text-gray-500'>Chargement des produits...</div>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow className='border-gray-200'>
                  <TableHead className='text-gray-600 font-medium'>Désignation</TableHead>
                  <TableHead className='text-gray-600 font-medium'>Type</TableHead>
                  <TableHead className='text-gray-600 font-medium'>Montant Min</TableHead>
                  <TableHead className='text-gray-600 font-medium'>Montant Max</TableHead>
                  <TableHead className='text-gray-600 font-medium'>Remboursement</TableHead>
                  <TableHead className='text-gray-600 font-medium'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(product => (
                    <TableRow key={product.id} className='border-gray-100 hover:bg-gray-50'>
                      <TableCell className='font-medium text-gray-900'>
                        {product.designation}
                      </TableCell>
                      <TableCell>
                        <Badge variant='secondary' className='capitalize'>
                          {product.type}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-gray-600'>
                        {formatCurrency(product.montantMinimum)}
                      </TableCell>
                      <TableCell className='text-gray-600'>
                        {formatCurrency(product.montantMaximum)}
                      </TableCell>
                      <TableCell>{product.remboursement.typeRemboursement}</TableCell>
                      <TableCell>
                        <div className='flex items-center space-x-2'>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-8 w-8 p-0 text-gray-600 hover:bg-gray-50'
                            title='Voir les détails'
                            onClick={() => handleViewProduct(product)}
                          >
                            <Eye className='w-4 h-4' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className='text-center py-8 text-gray-500'>
                      {searchTerm
                        ? 'Aucun produit trouvé pour cette recherche'
                        : 'Aucun produit disponible'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      {renderModals()}
    </Card>
  );
}
