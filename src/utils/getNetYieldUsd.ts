
export const getNetYieldUsd = (
  amountInUsd: number,
  leverageApy: string,
  leverage: string,
  maturityDaysLeft: number,
  addPerformancefee: boolean = true,
  addSlippage: boolean = true,
) => {
  const baseAmount = amountInUsd > 0 ? amountInUsd : 10000;

  const grossYield = (Number(leverageApy) / 100) * baseAmount * (maturityDaysLeft / 365);
  const slippage = addSlippage? baseAmount * Number(leverage) * 0.001 : 0; // 0.1% slippage on amount leveraged
  const netYield = addPerformancefee?(grossYield - slippage) * 0.9 : (grossYield - slippage); // after 10% performance fee on yield

  return netYield.toFixed(2);
};
