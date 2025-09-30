// frontend/components/products/ProductsTable.tsx

'use client';

import { Search, Plus, Trash2, Edit, Eye } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

import AddProductModal from '@/components/products/AddProductModal';
import ConfirmDeleteModal from '@/components/products/ConfirmDeleteModal';
import ProductEditModal from '@/components/products/ProductEditModal';
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
import { useCreateProduct, useRemoveProduct } from '@/hooks/products/useProductOperations';
import { ProductsAPI } from '@/lib/api/products';
import type { Product } from '@/types/Product';

export default function ProductsTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductInfo, setShowProductInfo] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showProductEdit, setShowProductEdit] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);

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

  const { removeProduct } = useRemoveProduct();
  const { createProduct } = useCreateProduct({
    reloadFn: fetchProducts,
  });

  // Charger les produits au montage
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = products.filter(
    product =>
      product.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowProductInfo(true);
  };

  // const handleDeleteClick = () => {
  //   setShowProductInfo(false);
  //   setShowConfirmDelete(true);
  // };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;

    try {
      await removeProduct(selectedProduct.id);
      await fetchProducts(); // Recharger la liste après suppression
      setShowConfirmDelete(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleCloseModals = () => {
    setShowProductInfo(false);
    setShowConfirmDelete(false);
    setShowProductEdit(false);
    setShowAddProduct(false);
    setSelectedProduct(null);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowProductEdit(true);
  };

  const handleCreateProduct = async (productData: {
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
  }) => {
    setIsCreatingProduct(true);
    try {
      await createProduct(productData);
      await fetchProducts(); // Recharger la liste après création
      handleCloseModals();
    } catch (error) {
      console.error('🔴 Erreur lors de la création du produit:', error);
    } finally {
      setIsCreatingProduct(false);
    }
  };

  const renderModals = () => {
    return (
      <>
        <AddProductModal
          isOpen={showAddProduct}
          onClose={handleCloseModals}
          onCreateProduct={handleCreateProduct}
          isCreating={isCreatingProduct}
        />
        {selectedProduct && (
          <>
            <ProductInfoModal
              isOpen={showProductInfo}
              onClose={handleCloseModals}
              // onDelete={handleDeleteClick}
              product={selectedProduct}
            />
            <ConfirmDeleteModal
              isOpen={showConfirmDelete}
              onClose={handleCloseModals}
              onConfirm={handleConfirmDelete}
              product={selectedProduct}
            />
            <ProductEditModal
              isOpen={showProductEdit}
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
          <Button
            className='bg-teal-500 cursor-pointer hover:bg-teal-600 text-white rounded-lg px-4 py-2'
            onClick={() => {
              setShowAddProduct(true);
            }}
          >
            <Plus className='w-4 h-4 mr-2' />
            Ajouter un produit
          </Button>
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
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-8 w-8 p-0 text-blue-600 hover:bg-blue-50'
                            title='Modifier'
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className='w-4 h-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-8 w-8 p-0 text-red-600 hover:bg-red-50'
                            title='Supprimer'
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowConfirmDelete(true);
                            }}
                          >
                            <Trash2 className='w-4 h-4' />
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
