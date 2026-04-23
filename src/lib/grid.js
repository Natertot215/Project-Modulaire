export const getGridCols = (n) => {
  if (n <= 5) return n;
  for (let c = 10; c >= 5; c--) { if (n % c === 0) return c; }
  return Math.min(10, Math.ceil(Math.sqrt(n)));
};
