import { Suspense } from 'react';

import type { Product } from '@/models/product';

import { ProductsTableSkeleton } from '../ui/skeletons';

import ProductListClient from './ProductListClient';

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
}

export default function ProductList({ products, isLoading }: ProductTableProps) {
  return (
    <Suspense fallback={<ProductsTableSkeleton />}>
      <ProductListClient products={products} isLoading={isLoading} />
    </Suspense>
  );
}
