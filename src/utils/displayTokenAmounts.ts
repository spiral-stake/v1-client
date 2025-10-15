import BigNumber from "bignumber.js";
import { Token } from "../types";

export const displayTokenAmount = (amount: BigNumber, token?: Token, decimalPlaces = 2): string => {
  // Handle NaN
  if (amount.isNaN()) {
    return `0${token?.symbol ? ` ${token.symbol}` : ""}`;
  }

  // Handle zero amount
  if (amount.isZero()) {
    return `0${token?.symbol ? ` ${token.symbol}` : ""}`;
  }

  // Handle very small amounts
  const smallestDisplayableValue = new BigNumber(10).pow(-decimalPlaces);
  if (amount.isPositive() && amount.isLessThan(smallestDisplayableValue)) {
    return `< ${smallestDisplayableValue}${token?.symbol ? ` ${token.symbol}` : ""}`;
  }

  // Format the amount
  let formattedAmount;
  if (amount.isInteger()) {
    formattedAmount = amount.toFixed(0);
  } else {
    // Use toFormat to avoid scientific notation and properly round
    formattedAmount = amount.toFormat(decimalPlaces, {
      decimalSeparator: ".",
      groupSeparator: "",
      groupSize: 0,
    });
  }

  return `${formattedAmount}${token?.symbol ? ` ${token.symbol}` : ""}`;
};
