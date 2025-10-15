export const getNetYieldUsd = (
  amountInUsd: number,
  leverageApy: string,
  leverage: string,
  maturityDaysLeft: number
) => {
  const baseAmount = amountInUsd > 0 ? amountInUsd : 10000;

  const grossYield = (Number(leverageApy) / 100) * baseAmount * (maturityDaysLeft / 365);
  const slippage = baseAmount * Number(leverage) * 0.001; // 0.1% slippage on amount leveraged
  const netYield = (grossYield - slippage) * 0.9; // after 10% performance fee on yield

  return netYield.toFixed(2);
};
