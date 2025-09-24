/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    // Inclure SEULEMENT les fichiers liés aux institutions
    'components/admin/institution-financiere/**/*.{ts,tsx}',
    'components/dashboard/InstitutionsList.tsx',
    'lib/api/institutions.ts',
    'types/institutions.ts',
    
    // Exclure les fichiers de configuration, tests, et types
    '!**/*.d.ts',
    '!*.config.ts',
    '!*.setup.ts',
    '!**/*.stories.{js,jsx,ts,tsx}',
    '!**/*.test.{js,jsx,ts,tsx}',
    '!**/*.spec.{js,jsx,ts,tsx}',
    '!**/__tests__/**',
    '!**/tests/**',
  ],

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'babel',

  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: ['text', 'lcov'],

  // A map from regular expressions to module names or to arrays of module names
  moduleNameMapper: {
    // Gestion des alias de chemins Next.js
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/utils/(.*)$': '<rootDir>/utils/$1',
    '^@/hooks/(.*)$': '<rootDir>/hooks/$1',

    // Mock Clerk pour éviter l'import ESM
  '^@clerk/nextjs$': '<rootDir>/__mocks__/clerkMock.js',
  '^@clerk/backend$': '<rootDir>/__mocks__/clerkMock.js',

    // Mock des fichiers CSS et assets
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
  },

  // Setup files after environment is initialized
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // The test environment that will be used for testing
  testEnvironment: 'jest-environment-jsdom',

  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  testPathIgnorePatterns: [
    '/node_modules/', 
    '/.next/', 
    '/coverage/',
    // Ignorer tous les tests SAUF ceux liés aux institutions
    '__tests__/app/',
    '__tests__/components/clerk-accept-invitation.test.tsx',
    '__tests__/components/connexion-form.test.tsx',
    '__tests__/components/dashboard/(?!InstitutionsList.test.tsx).*\\.test\\.tsx',
    '__tests__/components/global-loader.test.tsx',
    '__tests__/components/NoSSR.test.tsx',
    '__tests__/components/public/',
    '__tests__/components/users/',
    '__tests__/contexts/',
    '__tests__/hooks/',
    '__tests__/lib/(?!.*institutions).*\\.test\\.(ts|tsx)',
    '__tests__/lib/clerk-utils.test.ts',
    '__tests__/lib/validation.test.ts',
    '__tests__/middleware.test.ts',
    '__tests__/setup.test.tsx'
  ],

  // Ignore problematic source maps from Next.js builds
  coveragePathIgnorePatterns: [
   '/node_modules/',
  '/.next/',
  '/coverage/',
  // fichiers ou répertoires globaux Next à ignorer
  'app/layout\\.tsx$',
  'app/page\\.tsx$',
  'app/\\(auth\\)/admin/dashboard/page\\.tsx$',
  'app/\\(auth\\)/admin/institution-financiere/page\\.tsx$',
  'app/\\(auth\\)/layout\\.tsx$',
  'app/\\(auth\\)/admin/layout\\.tsx$',
  'app/\\(auth\\)/dashboard/',
  'app/\\(public\\)/',
  'app/login/',
  'app/forgot-password/',
  'components/public/layout/',
  "frontend/hooks",
  "frontend/components/public/layout/",
  "frontend/components/forgot-password-form.tsx",
  "frontend/components/password-input.tsx",
  "frontend/components/theme-provider.tsx",
  "frontend/components/admin/AdminSidebar.tsx",
  "frontend/app/sign-up/page.tsx",
  "frontend/app/(auth)/admin/dashboard/page.tsx",
  "frontend/middleware.ts",
  '\\.map$',
  ],

  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
  transformIgnorePatterns: [
    "/node_modules/(?!(.*\\.mjs$|@radix-ui|@hookform|@clerk|@clerk/nextjs|@clerk/backend))", // Ajout explicite de Clerk ESM
  ],

  // Options that will be passed to the testEnvironment
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
  },
};

export default createJestConfig(config);
