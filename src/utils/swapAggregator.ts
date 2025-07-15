import axios from "axios";
import FlashLeverage from "../contract-hooks/FlashLeverage";
import { CollateralToken, ExternalSwapData, SwapData, Token } from "../types";
import { parseUnits } from "./formatUnits";
import BigNumber from "bignumber.js";

const HOSTED_SDK_URL = "https://api-v2.pendle.finance/core/";
export const LIMIT_ORDER_URL = "https://api-v2.pendle.finance/limit-order/";

type MethodReturnType<Data> = {
  tx: {
    data: string;
    to: string;
    value: string;
  };
  contractCallParams: any;
  data: Data;
};

export async function callSDK<Data>(path: string, params: Record<string, any> = {}) {
  const response = await axios.get<MethodReturnType<Data>>(HOSTED_SDK_URL + path, {
    params,
  });

  return response.data;
}

export async function getExternalSwapData(
  leverageWrapperAddress: string,
  fromToken: Token,
  amount: string,
  collateralToken: CollateralToken
): Promise<ExternalSwapData> {
  const params = {
    receiver: leverageWrapperAddress,
    slippage: 0.01, // 1%
    tokenIn: fromToken.address,
    tokenOut: collateralToken.address,
    amountIn: parseUnits(amount, fromToken.decimals),
    enableAggregator: true,
  };

  console.log(params, "external swap");

  const res = await callSDK<SwapData>(
    `v1/sdk/${8453}/markets/${collateralToken.pendleMarket}/swap`,
    params
  );

  return {
    minCollateralOut: BigInt(res.data.amountOut),
    approxParams: res.contractCallParams[3],
    pendleSwap: res.contractCallParams[4].pendleSwap,
    swapData: res.contractCallParams[4].swapData,
    limitOrderData: res.contractCallParams[5],
  };
}

export async function getInternalSwapData(
  flashLeverage: FlashLeverage,
  collateralToken: CollateralToken,
  amountCollateral: string | bigint
) {
  // Need to do this calculation in client itself
  const amountLoan = await flashLeverage.flashLeverageCore.getLoanAmount(
    collateralToken,
    amountCollateral
  );

  const params = {
    receiver: flashLeverage.address,
    slippage: 0.01, // 1%
    tokenIn: flashLeverage.usdc.address,
    tokenOut: collateralToken.address,
    amountIn: amountLoan,
    enableAggregator: true,
  };

  console.log(params, "internal swap");

  const res = await callSDK<SwapData>(
    `v1/sdk/${8453}/markets/${collateralToken.pendleMarket}/swap`,
    params
  );

  return {
    approxParams: res.contractCallParams[3],
    pendleSwap: res.contractCallParams[4].pendleSwap,
    swapData: res.contractCallParams[4].swapData,
    limitOrderData: res.contractCallParams[5],
  };
}

export async function getInternalReswapData(
  flashLeverage: FlashLeverage,
  collateralToken: CollateralToken,
  amountLeveragedCollateral: BigNumber
) {
  const params = {
    receiver: flashLeverage.address,
    slippage: 0.01, // 1%
    tokenIn: collateralToken.address,
    tokenOut: flashLeverage.usdc.address,
    amountIn: String(parseUnits(String(amountLeveragedCollateral), collateralToken.decimals)),
    enableAggregator: true,
  };

  console.log(params);

  const res = await callSDK<SwapData>(
    `v1/sdk/${8453}/markets/${collateralToken.pendleMarket}/swap`,
    params
  );

  return {
    pendleSwap: res.contractCallParams[3].pendleSwap,
    swapData: res.contractCallParams[3].swapData,
    limitOrderData: res.contractCallParams[4],
  };
}
