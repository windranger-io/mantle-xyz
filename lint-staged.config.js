module.exports = {
  // Type check TypeScript files
  'apps/**/*.(ts|tsx)': () => 'tsc --noEmit',
  // Lint then format TypeScript and JavaScript files
  'apps/**/*.(ts|tsx|js)': filenames => [
    `eslint --fix ${filenames.join(' ')}`,
    `prettier --write ${filenames.join(' ')}`,
  ],
  'packages/**/*.(ts|tsx|js)': filenames => [
    `eslint --fix ${filenames.join(' ')}`,
    `prettier --write ${filenames.join(' ')}`,
  ],
  // Format MarkDown and JSON
  '**/*.(md|json)': filenames => `prettier --write ${filenames.join(' ')}`,
}
