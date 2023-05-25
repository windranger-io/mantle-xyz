// returns a promise that resolves after "ms" milliseconds
export const timeout = (ms: number) =>
  new Promise((res) => {
    setTimeout(res, ms);
  });
