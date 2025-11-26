export const getUniqueUsers = (positions: any[]): string[] => {
  const addresses: Record<string, boolean> = {};
  for (const p of positions) {
    const addr = p.positionId.slice(0, 42).toLowerCase();
    addresses[addr] = true;
  }
  return Object.keys(addresses);
};
