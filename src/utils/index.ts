import { CollateralToken } from "./../types/index";
import BigNumber from "bignumber.js";

export function calcLtv(amountStblUSD: BigNumber, amountCollateralInUsd: BigNumber) {
  const ltv = amountStblUSD.div(amountCollateralInUsd).multipliedBy(100);
  return ltv.isNaN() || !ltv.isFinite() ? "0.00" : ltv.toFixed(2);
}

export function calcLeverage(desiredLtv: string) {
  const maxLeverage = BigNumber(100).dividedBy(BigNumber(100).minus(BigNumber(desiredLtv)));
  return maxLeverage.isNaN() || !maxLeverage.isFinite() ? "1.0" : maxLeverage.toFixed(1);
}

export function calcLeverageApy(collateralTokenApy: string, borrowApy: string, desiredLtv: string) {
  const leverage = calcLeverage(desiredLtv);

  return BigNumber(collateralTokenApy)
    .multipliedBy(BigNumber(leverage))
    .minus(BigNumber(borrowApy).multipliedBy(BigNumber(leverage).minus(1)))
    .toFixed(2);
}

export function capitalize(str: string) {
  return str
    .split(" ")
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function isMatured(collateralToken: CollateralToken) {
  return currentTimestamp() > collateralToken.maturityTimestamp;
}

export function getMaturityDate(symbol: string) {
  const dateStr = symbol.split("-")[2];

  // Match day (1–2 digits), month (3 letters), and year (4 digits)
  const match = dateStr.match(/^(\d{1,2})([A-Z]{3})(\d{4})$/);

  if (!match) return dateStr; // Return original if not matching expected format

  const [, day, month, year] = match;
  return `${day} ${month} ${year}`;
}

export function getMaturityDaysLeft(dateString: string): number {
  // Parse the string into a Date
  const targetDate = new Date(dateString);

  // Ensure it's valid
  if (isNaN(targetDate.getTime())) {
    throw new Error("Invalid date format. Use format like '20 NOV 2025'");
  }

  // Normalize today's date (midnight)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Difference in ms → number
  const diff: number = targetDate.getTime() - today.getTime();

  // Convert to days
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function currentTimestamp() {
  return Math.floor(Date.now() / 1000);
}
