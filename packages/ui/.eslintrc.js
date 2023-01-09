module.exports = {
  // root: true,
  // This tells ESLint to load the config from the package `eslint-config-custom`
  extends: '@bitdao/eslint-config-next',
  settings: {
    next: {
      rootDir: ['packages/*/'],
    },
  },
  rules: {
    // Allow named function exports
    'react/function-component-definition': [
      2,
      {
        namedComponents: 'arrow-function',
      },
    ],
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',
  },
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: './tsconfig.json',
  },
}
