import axios from "axios";
import { CollateralToken } from "../types";
import BigNumber from "bignumber.js";
import { isMatured } from "../utils";

export const getImpliedApy = async (chainId: number, collateralToken: CollateralToken) => {
  if (chainId === 31337) chainId = 1;
  if (isMatured(collateralToken)) return BigNumber(0).toFixed(2);

  const { impliedApy } = (
    await axios.get(
      `https://api-v2.pendle.finance/core/v1/sdk/${chainId}/markets/${collateralToken.pendleMarket}/swapping-prices`
    )
  ).data;

  return BigNumber(impliedApy * 100).toFixed(2);
};
