// frontend/components/products/AddProductModal.tsx
'use client';
import ProductModal from './ProductModal';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProduct: (productData: any) => Promise<void>;
  isCreating: boolean;
}

export default function AddProductModal(props: AddProductModalProps) {
  return <ProductModal mode='create' {...props} />;
}
