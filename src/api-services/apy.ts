import axios from "axios";
import { CollateralToken } from "../types";
import BigNumber from "bignumber.js";
import { isMatured } from "../utils";

export const getTokenApy = async (chainId: number, collateralToken: CollateralToken) => {
  if (chainId === 31337) chainId = 1;

  if (collateralToken.isPt) {
    if (isMatured(collateralToken)) return BigNumber(0).toFixed(2);

    const { impliedApy: apy } = (
      await axios.get(
        `https://api-v2.pendle.finance/core/v1/sdk/${chainId}/markets/${collateralToken.pendleMarket}/swapping-prices`
      )
    ).data;

    return BigNumber(apy * 100).toFixed(2);
  } else {
    if (collateralToken.address === "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0") {
      // wstETH - mainnet
      return BigNumber(2.6).toFixed(2);
    }

    if (collateralToken.address === "0x03b54A6e9a984069379fae1a4fC4dBAE93B3bCCD") {
      // wstETH - polygon
      return BigNumber(2.73).toFixed(2);
    }

    if (collateralToken.address === "0xfa68FB4628DFF1028CFEc22b4162FCcd0d45efb6") {
      // maticX - polygon
      return BigNumber(2.41).toFixed(2);
    }

    if (collateralToken.address === "0x88887bE419578051FF9F4eb6C858A951921D8888") {
      // stcUSD - mainnet
      return BigNumber(12).toFixed(2);
    } else {
      return "";
    }
  }
};
