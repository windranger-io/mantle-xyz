module.exports = {
  root: true,
  extends: "@mantle/eslint-config-next",
  settings: {
    next: {
      rootDir: ["apps/*/"],
    },
  },
  rules: {
    "import/no-extraneous-dependencies": "off",
    "import/prefer-default-export": "off",
    "react/require-default-props": "off",
  },
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: "./tsconfig.json",
  },
};
