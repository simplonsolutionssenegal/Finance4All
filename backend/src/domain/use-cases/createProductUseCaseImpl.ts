// src/domain/use-cases/createProductUseCaseImpl.ts
import type { Product } from '@/domain/entities/Product';
import type { ProductRepository } from '@/domain/repositories/ProductRepository';

export interface CreateProductUseCase {
  execute(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product>;
}

export class CreateProductUseCaseImpl implements CreateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(productData: unknown): Promise<Product> {
    // Validation et conversion du type
    const validatedData = this.validateProductData(productData);
    return await this.productRepository.create(validatedData);
  }

  private validateProductData(data: unknown): Omit<Product, 'id' | 'createdAt' | 'updatedAt'> {
    if (!data || typeof data !== 'object') {
      throw new Error('Données du produit invalides');
    }

    const productData = data as Record<string, unknown>;

    if (
      !productData.designation ||
      typeof productData.designation !== 'string' ||
      productData.designation.trim() === ''
    ) {
      throw new Error('La désignation du produit est requise');
    }

    if (!productData.type || typeof productData.type !== 'string') {
      throw new Error('Le type de produit est requis');
    }

    if (
      !productData.montantMinimum ||
      typeof productData.montantMinimum !== 'number' ||
      productData.montantMinimum <= 0
    ) {
      throw new Error('Le montant minimum doit être positif');
    }

    if (
      !productData.montantMaximum ||
      typeof productData.montantMaximum !== 'number' ||
      productData.montantMaximum <= productData.montantMinimum
    ) {
      throw new Error('Le montant maximum doit être supérieur au montant minimum');
    }

    // Validation du remboursement
    if (!productData.remboursement || typeof productData.remboursement !== 'object') {
      throw new Error('Les informations de remboursement sont requises');
    }

    const remboursement = productData.remboursement as Record<string, unknown>;
    if (
      !remboursement.tauxInteret ||
      typeof remboursement.tauxInteret !== 'number' ||
      remboursement.tauxInteret < 0
    ) {
      throw new Error("Le taux d'intérêt ne peut pas être négatif");
    }

    // Validation des conditions d'éligibilité
    if (
      !productData.conditionsEligibilite ||
      typeof productData.conditionsEligibilite !== 'object'
    ) {
      throw new Error("Les conditions d'éligibilité sont requises");
    }

    const conditions = productData.conditionsEligibilite as Record<string, unknown>;
    if (
      !conditions.ageMinimum ||
      typeof conditions.ageMinimum !== 'number' ||
      conditions.ageMinimum < 0 ||
      conditions.ageMinimum > 150
    ) {
      throw new Error('Âge minimum invalide');
    }

    if (
      !conditions.revenuMinimum ||
      typeof conditions.revenuMinimum !== 'number' ||
      conditions.revenuMinimum < 0
    ) {
      throw new Error('Le revenu minimum doit être positif');
    }

    return productData as Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
  }
}
