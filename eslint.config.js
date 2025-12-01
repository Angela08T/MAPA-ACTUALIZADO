import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Reglas de Clean Code
      'no-console': 'warn', // Advertir sobre console.log (debe usar logger)
      'no-debugger': 'error', // No permitir debugger en código
      'prefer-const': 'error', // Forzar uso de const cuando sea posible
      'no-var': 'error', // No permitir var (usar let/const)
      eqeqeq: ['error', 'always'], // Forzar === en lugar de ==
    },
  },
];
