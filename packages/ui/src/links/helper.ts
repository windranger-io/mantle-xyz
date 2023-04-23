export const cls = (input: string): string =>
  input
    .replace(/\s+/gm, ' ')
    .split(' ')
    .filter((cond: string) => typeof cond === 'string')
    .join(' ')
    .trim()
