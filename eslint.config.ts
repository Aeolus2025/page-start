import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import vue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['dist/**', 'dist-node/**', 'node_modules/**', 'src/assets/js/iconfont.js'],
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
      },
      globals: {
        // Browser runtime globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        createImageBitmap: 'readonly',
        FileReader: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
      },
    },
  },

  // Keep formatting responsibility in Prettier
  eslintConfigPrettier,

  {
    rules: {
      'vue/multi-word-component-names': 'off',
      // TS 接管未定义检查
      'no-undef': 'off',
      // 允许以下划线开头的未使用变量（如 _event、_engineId）
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
];
