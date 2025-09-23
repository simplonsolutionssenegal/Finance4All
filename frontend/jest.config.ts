// jest.config.ts
import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    'components/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!components/ui/**',
    '!coverage/**',
    '!**/*.d.ts',
    '!*.config.ts',
    '!*.setup.ts',
    '!**/*.stories.{js,jsx,ts,tsx}',
    '!types/**',
    '!**/*.test.{js,jsx,ts,tsx}',
    '!**/*.spec.{js,jsx,ts,tsx}',
    '!**/__tests__/**',
    '!**/tests/**',
  ],
  coverageDirectory: 'coverage',
  coverageProvider: 'babel',
  coverageReporters: ['text', 'lcov'],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/utils/(.*)$': '<rootDir>/utils/$1',
    '^@/hooks/(.*)$': '<rootDir>/hooks/$1',

    // Assets & styles
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',

    // Next/font & autres modules Next à mocker
    '^next/font/(.*)$': '<rootDir>/__mocks__/nextFontMock.js',
  },

  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  testEnvironment: 'jest-environment-jsdom',

  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/coverage/'],

  coveragePathIgnorePatterns: ['/node_modules/', '/.next/', '/coverage/', '\\.map$'],

  // ⬇️ Transformer certains packages ESM dans node_modules (dont Clerk)
  transformIgnorePatterns: [
    '/node_modules/(?!(@clerk/.*|@radix-ui/.*|@hookform/.*|lucide-react|tslib)/)',
  ],

  // Option utile pour certaines libs ESM
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
    customExportConditions: ['node', 'require', 'default'],
  },
};

export default createJestConfig(config);
