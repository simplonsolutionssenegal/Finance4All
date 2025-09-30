module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/'],
  testMatch: ['__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    // inclure tous les fichiers TypeScript dans le dossier components produits
    'domain/entities/products/**/*.{ts,tsx}',
    'domain/repositories/products/**/*.{ts,tsx}',
    'domain/use-cases/createProductUseCaseImpl.ts',
    'domain/use-cases/getProductByIdUseCaseImpl.ts',
    'domain/use-cases/getProductsUseCaseImpl.ts',
    'infrastructure/database/PrismaProductRepository/**/*.{ts,tsx}',
    'infrastructure/web/controllers/ProductController.ts',
    'infrastructure/web/routes/product.routes.ts',

    'hooks/products/**/*.{ts,tsx}',
    'lib/api/products/**/*.{ts,tsx}',

    // exclure les fichiers de définition de types et les tests
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!__tests__/**',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testTimeout: 30000,
  verbose: true,
};
