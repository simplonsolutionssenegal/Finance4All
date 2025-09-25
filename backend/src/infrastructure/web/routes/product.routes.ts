// src/infrastructure/web/routes/product.routes.ts (exactement comme vos user routes)
import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { GetProductByIdUseCaseImpl } from '@/domain/use-cases/getProductByIdUseCaseImpl';
import { GetProductsUseCaseImpl } from '@/domain/use-cases/getProductsUseCaseImpl';
import { CreateProductUseCaseImpl } from '@/domain/use-cases/createProductUseCaseImpl';
import { PrismaProductRepository } from '@/infrastructure/database/PrismaProductRepository';
// ...existing code...

const router = Router();

// Dependency Injection - utilisation de PrismaProductRepository
const productRepository = new PrismaProductRepository();
const getProductByIdUseCase = new GetProductByIdUseCaseImpl(productRepository);
const getProductsUseCase = new GetProductsUseCaseImpl(productRepository);
const createProductUseCase = new CreateProductUseCaseImpl(productRepository);

const productController = new ProductController(
  getProductByIdUseCase,
  getProductsUseCase,
  createProductUseCase
);

// Routes avec le même style que vos user routes
router.get('/', (req, res) => productController.getProducts(req, res));
router.post('/', (req, res) => productController.createProduct(req, res));

router.route('/:id').get((req, res) => productController.getProductById(req, res));

export default router;
