// eslint.config.cjs (flat config)
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const path = require('path');

module.exports = [
  // Ignorés globaux
  {
    ignores: [
      'dist/**/*',
      'build/**/*',
      'coverage/**/*',
      'node_modules/**/*',
      'src/**/*.test.ts',
      'src/__tests__/**/*.ts'
    ],
  },

  // Règles pour TS
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        // Assure la résolution correcte du tsconfig, surtout en CI
        tsconfigRootDir: __dirname,
        project: path.join(__dirname, 'tsconfig.json'),
      },
      globals: { },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },

    // Tu peux “étendre” les configs recommandées via flat config en important leurs règles :
    // (équivalent de extends: ['plugin:@typescript-eslint/recommended-type-checked', ...])
    rules: {
      // ----- Règles @typescript-eslint -----
      ...tseslint.configs['recommended-type-checked']?.rules,
      ...tseslint.configs['stylistic-type-checked']?.rules,

      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',

      // ----- Règles JS de base -----
      'prefer-const': 'error',
      'no-var': 'error',
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { allowTemplateLiterals: true }],

      // 👉 Autorise la virgule finale uniquement en **multiligne** (bon pour les diffs)
      'comma-dangle': ['error', 'always-multiline'],

      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
    },
    settings: {
      // Optionnel: si tu utilises import/resolver ts
    },
  },
];
