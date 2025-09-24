module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/'],
  testMatch: [
    // Inclure SEULEMENT les tests liés aux institutions
    '**/*institutionFinanciere*.test.ts',
    '**/*InstitutionFinanciere*.test.ts',
    '**/*institution*.test.ts',
    '**/pagination*.test.ts',
    '**/get-paginated-institutions.test.ts',
    '**/PrismaInstitutionFinanciereRepository*.test.ts'
  ],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true
      }
    }],
  },
  collectCoverageFrom: [
    // Collecte de couverture SEULEMENT pour les fichiers liés aux institutions
    'src/**/*institutionFinanciere*.ts',
    'src/**/*InstitutionFinanciere*.ts',
    'src/**/*institution*.ts',
    'src/**/InstitutionFinanciereValidator*.ts',
    'src/**/PrismaInstitutionFinanciereRepository*.ts',
    'src/**/createInstitutionFinanciere*.ts',
    'src/**/updateInstitutionFinanciere*.ts',
    'src/**/deleteInstitutionFinanciere*.ts',
    'src/**/getInstitutionFinanciere*.ts',
    'src/**/institution*Controller*.ts',
    'src/**/pagination*.ts',
    '!src/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testTimeout: 30000,
  verbose: true,
};
