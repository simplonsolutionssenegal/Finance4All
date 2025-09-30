// frontend/app/(auth)/products/page.tsx

import ProductsHeader from '@/components/products/ProductsHeader';
import ProductsTable from '@/components/products/ProductsTable';

const ProductsPage = () => {
  return (
    <div className='min-h-full bg-gray-50'>
      <div className='space-y-6'>
        {/* Header de l'organisation */}
        <ProductsHeader
          logoSrc='/assets/images/institutionFinanciere.jpg'
          name="Nom de l'Institution Financière"
          status='ACTIF'
          website='www.institution-finance.sn'
          description="Description de l'institution : Établissement financier proposant des solutions de crédit, prêts et assurances adaptées aux besoins des particuliers et entreprises au Sénégal."
          zones={[
            { id: 1, label: 'Senegal' },
            { id: 2, label: 'Cameroun' },
            { id: 3, label: "Cote d'Ivoire" },
          ]}
        />

        {/* Tableau des produits */}
        <ProductsTable />
      </div>
    </div>
  );
};

export default ProductsPage;
