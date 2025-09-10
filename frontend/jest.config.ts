/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    "**/*.{js,jsx,ts,tsx}",
    "components/**/*.{ts,tsx}",
    "app/**/*.{ts,tsx}",
    "!components/ui/**",
    "!coverage/**",
    "!**/*.d.ts",
    "!*.config.ts",
    "!*.setup.ts",
    "!**/*.stories.{js,jsx,ts,tsx}", // Exclure les stories Storybook
    "!types/**", // Exclure les fichiers de types
    "!**/*.test.{js,jsx,ts,tsx}", // Exclure les fichiers de test
    "!**/*.spec.{js,jsx,ts,tsx}", // Exclure les fichiers de spec
    "!**/__tests__/**", // Exclure le dossier __tests__
    "!**/tests/**", // Exclure le dossier tests
  ],

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "babel",

  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: ["text", "lcov"],

    // A map from regular expressions to module names or to arrays of module names
  moduleNameMapper: {
    // Gestion des alias de chemins Next.js
    "^@/(.*)$": "<rootDir>/$1",
    "^@/components/(.*)$": "<rootDir>/components/$1",
    "^@/lib/(.*)$": "<rootDir>/lib/$1",
    "^@/utils/(.*)$": "<rootDir>/utils/$1",
    "^@/hooks/(.*)$": "<rootDir>/hooks/$1",
    
    // Mock des fichiers CSS et assets
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": 
      "<rootDir>/__mocks__/fileMock.js",
  },

  // Setup files after environment is initialized
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  // The test environment that will be used for testing
  testEnvironment: 'jest-environment-jsdom',

  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  testPathIgnorePatterns: [
    "/node_modules/",
    "/.next/",
    "/coverage/",
  ],

  // Ignore problematic source maps from Next.js builds
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/.next/",
    "/coverage/",
    "\\.map$", // Ignore all .map files
  ],

  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
  transformIgnorePatterns: [
    "/node_modules/(?!(.*\\.mjs$|@radix-ui|@hookform|@clerk))", // Permet la transformation des modules ES6 et Clerk
  ],

  // Options that will be passed to the testEnvironment
  testEnvironmentOptions: {
    url: "http://localhost:3000",
  },

};

export default createJestConfig(config);
