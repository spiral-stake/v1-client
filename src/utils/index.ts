import BigNumber from "bignumber.js";

export function calcLtv(amountSpiUsd: BigNumber, amountCollateralInUsd: BigNumber) {
  const ltv = amountSpiUsd.div(amountCollateralInUsd).multipliedBy(100);
  return ltv.isNaN() || !ltv.isFinite() ? "0.00" : ltv.toFixed(2);
}

export function calcMaxLeverage(ltv: BigNumber) {
  const maxLeverage = BigNumber(100).dividedBy(BigNumber(100).minus(ltv));
  return maxLeverage.isNaN() || !maxLeverage.isFinite() ? "1.0" : maxLeverage.toFixed(1);
}
