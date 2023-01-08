module.exports = {
  root: true,
  // This tells ESLint to load the config from the package `eslint-config-custom`
  extends: ['custom'],
  settings: {
    next: {
      rootDir: ['apps/*/'],
    },
  },
  rules: {
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',
  },
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: './tsconfig.json',
  },
}
