module.exports = {
  root: true,
  extends: '@mantle/eslint-config-next',
  settings: {
    next: {
      rootDir: ['./'],
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
