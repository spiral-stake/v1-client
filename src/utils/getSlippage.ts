export function getSlippage(amount: number): number {
  if (amount < 500) return 0.01;   // 1%
  if (amount > 5000) return 0.001; // 0.1%

  return 0.01 - ((amount - 500) / (5000 - 500)) * (0.01 - 0.001);
}
