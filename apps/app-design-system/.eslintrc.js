module.exports = {
  root: true,
  extends: '@bitdao/eslint-config-next',
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
