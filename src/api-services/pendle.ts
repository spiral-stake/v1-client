import axios from "axios";
import { CollateralToken } from "../types";
import BigNumber from "bignumber.js";

export const getImpliedApy = async (chainId: number, collateralToken: CollateralToken) => {
  if (chainId === 31337) chainId = 1;

  const { impliedApy } = (
    await axios.get(
      `https://api-v2.pendle.finance/core/v1/sdk/${chainId}/markets/${collateralToken.pendleMarket}/swapping-prices`
    )
  ).data;

  return BigNumber(impliedApy * 100).toFixed(2);
};
