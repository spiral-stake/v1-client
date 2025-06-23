import BigNumber from "bignumber.js";

export function calcLtv(amountStblUSD: BigNumber, amountCollateralInUsd: BigNumber) {
  const ltv = amountStblUSD.div(amountCollateralInUsd).multipliedBy(100);
  return ltv.isNaN() || !ltv.isFinite() ? "0.00" : ltv.toFixed(2);
}

export function calcMaxLeverage(desiredLtv: string) {
  const maxLeverage = BigNumber(100).dividedBy(BigNumber(100).minus(BigNumber(desiredLtv)));
  return maxLeverage.isNaN() || !maxLeverage.isFinite() ? "1.0" : maxLeverage.toFixed(1);
}

export function calcLeverageApy(collateralTokenApy: string, borrowApy: string, desiredLtv: string) {
  const leverage = calcMaxLeverage(desiredLtv);

  return BigNumber(collateralTokenApy)
    .multipliedBy(BigNumber(leverage))
    .minus(BigNumber(borrowApy).multipliedBy(BigNumber(leverage).minus(1)))
    .toFixed(2);
}
