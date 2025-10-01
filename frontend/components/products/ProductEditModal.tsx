// frontend/components/products/ProductEditModal.tsx
'use client';
import type { Product } from '@/types/Product';

import ProductModal from './ProductModal';

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export default function ProductEditModal(props: ProductEditModalProps) {
  return <ProductModal mode='edit' {...props} />;
}
