// frontend/app/(auth)/products/page.tsx
import ProductsTable from '@/components/products/ProductsTable';

const ProductsPage = () => {
  return (
    <div className='min-h-full bg-gray-50'>
      <div className='space-y-6'>
        {/* Tableau des produits */}
        <ProductsTable />
      </div>
    </div>
  );
};

export default ProductsPage;
