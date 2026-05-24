const js = require('@eslint/js');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const reactRefresh = require('eslint-plugin-react-refresh');

const browserGlobals = {
  console: 'readonly',
  document: 'readonly',
  fetch: 'readonly',
  localStorage: 'readonly',
  navigator: 'readonly',
  setTimeout: 'readonly',
  sessionStorage: 'readonly',
  window: 'readonly',
};

module.exports = [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.lighthouseci/**',
    ],
  },
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: browserGlobals,
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      'react/jsx-uses-vars': 'error',
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
];
