// eslint.config.cjs
module.exports = [
  {
    // Apply this configuration to all JavaScript files
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 12,
      globals: {
        require: 'readonly',
        module: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        console: 'readonly',
      },
    },
    plugins: {
      // Load the Prettier plugin
      prettier: require('eslint-plugin-prettier'),
    },
  },
];
