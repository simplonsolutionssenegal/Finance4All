import { ProductSimulator } from '@/components/product-simulator/product-simulator';
import PublicFooter from '@/components/public/layout/footer';
import PublicHeader from '@/components/public/layout/header';

export default function ProductSimulatorPage() {
  return (
    <div className='min-h-screen overflow-visible'>
      {/* Header */}
      <PublicHeader />

      {/* Product Simulator */}
      <ProductSimulator />

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
