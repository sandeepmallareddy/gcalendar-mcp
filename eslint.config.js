import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['coverage/**', 'node_modules/**', 'build/**'],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];
