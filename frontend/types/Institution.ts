export interface Institution {
  id: string;
  name: string;
  logo: string;
  products: InstitutionProduct[];
}

export interface InstitutionProduct {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'CREDIT' | 'EPARGNE' | 'INVESTISSEMENT' | 'ASSURANCE';
  rates: {
    min: number;
    max: number;
  };
  limits: {
    amount: { min: number; max: number };
    duration: { min: number; max: number };
  };
}
