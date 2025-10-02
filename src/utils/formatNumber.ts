import BigNumber from "bignumber.js";

export function formatNumber(value: number | BigNumber, decimals: number = 2): string {
  let num = value instanceof BigNumber ? value : new BigNumber(value);

  const billion = new BigNumber(1e9);
  const million = new BigNumber(1e6);
  const thousand = new BigNumber(1e3);

  if (num.isGreaterThanOrEqualTo(billion)) {
    return num.dividedBy(billion).toFixed(decimals) + "B";
  } else if (num.isGreaterThanOrEqualTo(million)) {
    return num.dividedBy(million).toFixed(decimals) + "M";
  } else if (num.isGreaterThanOrEqualTo(thousand)) {
    return num.dividedBy(thousand).toFixed(decimals) + "K";
  } else {
    return num.toFixed(decimals);
  }
}
