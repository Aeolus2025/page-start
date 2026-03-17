import js from '@eslint/js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';
import vue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import eslintConfigPrettier from 'eslint-config-prettier';

const tsconfigRootDir = path.dirname(fileURLToPath(import.meta.url));

export default [
  {
    ignores: ['dist/**', 'dist-node/**', 'node_modules/**'],
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  ...vue.configs['flat/recommended'],

  // TypeScript + Vue SFC
  {
    files: ['**/*.{ts,tsx,vue}'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
        project: ['./tsconfig.json', './tsconfig.node.json'],
        tsconfigRootDir,
      },
    },
  },

  // Keep formatting responsibility in Prettier
  eslintConfigPrettier,

  {
    rules: {
      // Vue: allow multi-word? keep default; but enforce stable component naming patterns
      'vue/multi-word-component-names': 'off',
    },
  },
];
