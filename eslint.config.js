// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const queryPlugin = require('@tanstack/eslint-plugin-query');
const prettierConfig = require('eslint-config-prettier');

module.exports = defineConfig([
  expoConfig,
  ...queryPlugin.configs['flat/recommended'],
  prettierConfig,
  {
    ignores: [
      'dist/*',
      'node_modules/*',
      '.expo/*',
      'web-build/*',
      'ios/*',
      'android/*',
      'supabase/functions/**',
    ],
  },
]);
