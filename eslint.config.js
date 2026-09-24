// ESLint 9 flat config.
// Раньше в package.json был скрипт lint, но конфига не было — команда падала.

import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import tsParser from '@typescript-eslint/parser'
import globals from 'globals'

export default [
  {
    // Шаблон '*.cjs' в flat config матчит только корень — нужен '**/*.cjs',
    // иначе e2e-скрипт на CommonJS проверяется правилами для браузера.
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '.shots/**', '**/*.cjs'],
  },
  js.configs.recommended,
  // essential, а не recommended: recommended — это в основном правила
  // форматирования шаблонов (переносы строк, атрибуты), которые дают
  // 800+ предупреждений и топят реальные находки.
  ...pluginVue.configs['flat/essential'],
  {
    files: ['**/*.{js,mjs,ts,vue}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: ['.vue'],
      },
    },
    rules: {
      // Многие компоненты — одно слово по смыслу (HomeHero, PlayerCard).
      'vue/multi-word-component-names': 'off',
      // console.warn в обработчиках ошибок оставлен намеренно.
      'no-console': ['warn', { allow: ['warn', 'error', 'debug'] }],
      // TS-типы (RequestInit, ImportMetaEnv) no-undef не видит — их
      // проверяет vue-tsc, здесь правило только шумит.
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'vue/no-v-html': 'error',
      'vue/component-name-in-template-casing': ['warn', 'PascalCase'],
    },
  },
]
