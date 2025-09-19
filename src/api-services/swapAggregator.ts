import { InternalReswapData } from "../types/index";
import axios from "axios";
import FlashLeverage from "../contract-hooks/FlashLeverage";
import { CollateralToken, InternalSwapData, Token } from "../types";
import { parseUnits } from "../utils/formatUnits";
import BigNumber from "bignumber.js";

const HOSTED_SDK_URL = "https://api-v2.pendle.finance/core";

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
  chainId: number,
  slippage: number,
  flashLeverageAddress: string,
  fromToken: Token,
  amount: string,
  collateralToken: CollateralToken
): Promise<InternalSwapData> {
  if (chainId == 31337) chainId = 1;

  const params = {
    receiver: flashLeverageAddress,
    slippage,
    tokenIn: fromToken.address,
    tokenOut: collateralToken.address,
    amountIn: parseUnits(amount, fromToken.decimals),
    enableAggregator: true,
    aggregators: "odos, okx, paraswap",
  };

  const res = await callSDK<InternalSwapData>(
    `/v2/sdk/${chainId}/markets/${collateralToken.pendleMarket}/swap`,
    params
  );

  return {
    approxParams: res.contractCallParams[3],
    pendleSwap: res.contractCallParams[4].pendleSwap,
    tokenMintSy: res.contractCallParams[4].tokenMintSy,
    minPtOut: BigInt(res.contractCallParams[2]),
    swapData: res.contractCallParams[4].swapData,
    limitOrderData: res.contractCallParams[5],
  };
}

export async function getInternalSwapData(
  chainId: number,
  slippage: number,
  flashLeverage: FlashLeverage,
  collateralToken: CollateralToken,
  desiredLtv: string,
  amountCollateral: string | bigint | BigInt
): Promise<InternalSwapData> {
  if (chainId == 31337) chainId = 1;

  // Need to do this calculation in client itself
  const amountLoan = await flashLeverage.flashLeverageCore.calcLeverageFlashLoan(
    desiredLtv,
    collateralToken,
    amountCollateral
  );

  const params = {
    receiver: flashLeverage.flashLeverageCore.address,
    slippage,
    tokenIn: collateralToken.loanToken.address,
    tokenOut: collateralToken.address,
    amountIn: amountLoan,
    enableAggregator: true,
    aggregators: "odos, okx, paraswap",
  };

  const res = await callSDK(
    `/v2/sdk/${chainId}/markets/${collateralToken.pendleMarket}/swap`,
    params
  );

  return {
    approxParams: res.contractCallParams[3],
    pendleSwap: res.contractCallParams[4].pendleSwap,
    tokenMintSy: res.contractCallParams[4].tokenMintSy,
    minPtOut: BigInt(res.contractCallParams[2]),
    swapData: res.contractCallParams[4].swapData,
    limitOrderData: res.contractCallParams[5],
  };
}

export async function getInternalReswapData(
  chainId: number,
  slippage: number,
  flashLeverage: FlashLeverage,
  collateralToken: CollateralToken,
  amountLeveragedCollateral: BigNumber
): Promise<InternalReswapData> {
  if (chainId == 31337) chainId = 1;

  const params = {
    receiver: flashLeverage.flashLeverageCore.address,
    slippage,
    tokenIn: collateralToken.address,
    tokenOut: collateralToken.loanToken.address,
    amountIn: String(parseUnits(String(amountLeveragedCollateral), collateralToken.decimals)),
    enableAggregator: true,
    aggregators: "odos, okx, paraswap",
  };

  const res = await callSDK(
    `/v2/sdk/${chainId}/markets/${collateralToken.pendleMarket}/swap`,
    params
  );

  return {
    pendleSwap: res.contractCallParams[3].pendleSwap,
    tokenRedeemSy: res.contractCallParams[3].tokenRedeemSy,
    minTokenOut: BigInt(res.contractCallParams[3].minTokenOut),
    swapData: res.contractCallParams[3].swapData,
    limitOrderData: res.contractCallParams[4],
  };
}
