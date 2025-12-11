import { LeveragePosition } from "../types";

export const getNetYieldUsd = (
  amountCollateral: number,
  leverageApy: string,
  leverage: string,
  maturityDaysLeft: number,
  addPerformancefee: boolean = true,
  addSlippage: boolean = true
) => {
  const grossYield = (Number(leverageApy) / 100) * amountCollateral * (maturityDaysLeft / 365);
  const slippage = addSlippage ? amountCollateral * Number(leverage) * 0.001 : 0; // 0.1% slippage on amount leveraged
  const netYield = addPerformancefee ? (grossYield - slippage) * 0.9 : grossYield - slippage; // after 10% performance fee on yield

  return netYield.toFixed(2);
};

export const getProjectedYieldInLoanToken = (
  pos: LeveragePosition,
  addPerformancefee: boolean = true,
  addSlippage: boolean = true
) => {
  const grossYield =
    (Number(pos.leverageApy) / 100) * Number(pos.amountCollateralInLoanToken) * (365 / 365);

  const slippage = addSlippage
    ? Number(pos.amountCollateralInLoanToken) * Number(pos.leverage) * 0.001
    : 0; // 0.1% slippage on amount leveraged
  const netYield = addPerformancefee ? (grossYield - slippage) * 0.9 : grossYield - slippage; // after 10% performance fee on yield

  return netYield;
};
