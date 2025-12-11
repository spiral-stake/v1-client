import axios from "axios";
import FlashLeverage from "../contract-hooks/FlashLeverage";
import { CollateralToken, LeverageSwapData, DeleverageSwapData, Token, SwapData } from "../types";
import { parseUnits } from "../utils/formatUnits";
import BigNumber from "bignumber.js";
import { isMatured, zeroAddress } from "../utils";
import { chainConfig } from "../config/chainConfig";
import { createDefaultLimitOrderData, createDefualtApproxParams } from "../utils/pendle";

const HOSTED_SDK_URL = "https://api-v2.pendle.finance/core";

export async function callKyberSDK(
  chainId: number,
  flashLeverageAddress: string,
  params: Record<string, any> = {}
): Promise<{
  minTokenOut: bigint;
  swapData: SwapData;
}> {
  const HOSTED_SDK_URL = "https://aggregator-api.kyberswap.com";

  // 1. GET swap routes
  const routesRes = await axios.get(
    `${HOSTED_SDK_URL}/${chainConfig[chainId].name}/api/v1/routes`,
    { params }
  );

  const swapRoutes = routesRes.data?.data;

  // 2. POST to build route
  const buildRes = await axios.post(
    `${HOSTED_SDK_URL}/${chainConfig[chainId].name}/api/v1/route/build`,
    {
      ...swapRoutes,
      sender: flashLeverageAddress,
      recipient: flashLeverageAddress,
      slippageTolerance: 100, // hardcoded
    }
  );

  const data = buildRes.data?.data;

  return {
    minTokenOut: BigInt(0), // Needs to change
    swapData: {
      swapType: 0,
      extRouter: data.routerAddress,
      extCalldata: data.data,
      needScale: false,
    },
  };
}

export async function callPendleSDK(path: string, params: Record<string, any> = {}) {
  const response = await axios.get(HOSTED_SDK_URL + path, {
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
): Promise<any> {
  if (chainId == 31337) chainId = 1;

  const params = {
    receiver: flashLeverageAddress,
    slippage,
    tokenIn: fromToken.address,
    tokenOut: collateralToken.address,
    amountIn: parseUnits(amount, fromToken.decimals),
    enableAggregator: true,
    aggregators: "kyberswap",
  };

  const res = await callPendleSDK(
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

// Slippage hardcoded to 0.1%
export async function getLeverageSwapData(
  chainId: number,
  flashLeverage: FlashLeverage,
  collateralToken: CollateralToken,
  desiredLtv: string,
  amountCollateral: string | bigint | BigInt
): Promise<LeverageSwapData> {
  if (chainId == 31337) chainId = 1;

  // Need to do this calculation in client itself
  const amountLoan = await flashLeverage.calcLeverageFlashLoan(
    desiredLtv,
    collateralToken,
    amountCollateral
  );

  if (collateralToken.isPt) {
    const params = {
      receiver: flashLeverage.address,
      slippage: 0.001, // hardcoded to 0.1%
      tokenIn: collateralToken.loanToken.address,
      tokenOut: collateralToken.address,
      amountIn: amountLoan,
      enableAggregator: true,
      aggregators: "kyberswap",
    };

    const res = await callPendleSDK(
      `/v2/sdk/${chainId}/markets/${collateralToken.pendleMarket}/swap`,
      params
    );

    return {
      approxParams: res.contractCallParams[3],
      pendleSwap: res.contractCallParams[4].pendleSwap,
      tokenMintSy: res.contractCallParams[4].tokenMintSy,
      minTokenOut: BigInt(res.contractCallParams[2]),
      swapData: res.contractCallParams[4].swapData,
      limitOrderData: res.contractCallParams[5],
    };
  } else {
    const params = {
      tokenIn: collateralToken.loanToken.address,
      tokenOut: collateralToken.address,
      amountIn: amountLoan,
    };

    const data = await callKyberSDK(chainId, flashLeverage.address, params);

    return {
      minTokenOut: data.minTokenOut,
      swapData: data.swapData,
      pendleSwap: zeroAddress,
      approxParams: createDefualtApproxParams(),
      tokenMintSy: zeroAddress,
      limitOrderData: createDefaultLimitOrderData(),
    };
  }
}

// Slippage hardcoded to 0.1%
export async function getDeLeverageSwapData(
  chainId: number,
  flashLeverage: FlashLeverage,
  collateralToken: CollateralToken,
  amountLeveragedCollateral: BigNumber
): Promise<DeleverageSwapData> {
  if (chainId == 31337) chainId = 1;

  const amountIn = String(parseUnits(String(amountLeveragedCollateral), collateralToken.decimals));

  if (collateralToken.isPt) {
    if (!isMatured(collateralToken)) {
      const params = {
        receiver: flashLeverage.address,
        slippage: 0.001, // hardcoded to 0.1%
        tokenIn: collateralToken.address,
        tokenOut: collateralToken.loanToken.address,
        amountIn,
        enableAggregator: true,
        aggregators: "kyberswap, odos",
      };

      const res = await callPendleSDK(
        `/v2/sdk/${chainId}/markets/${collateralToken.pendleMarket}/swap`,
        params
      );

      return {
        swapData: res.contractCallParams[3].swapData,
        minTokenOut: BigInt(res.contractCallParams[3].minTokenOut),
        pendleSwap: res.contractCallParams[3].pendleSwap,
        tokenRedeemSy: res.contractCallParams[3].tokenRedeemSy,
        limitOrderData: res.contractCallParams[4],
      };
    } else {
      const params = {
        receiver: flashLeverage.address,
        slippage: 0.001, // hardcoded to 0.1%
        yt: collateralToken.YT,
        tokenOut: collateralToken.loanToken.address,
        amountIn,
        enableAggregator: true,
        aggregators: "kyberswap",
      };

      const res = await callPendleSDK(`/v2/sdk/${chainId}/redeem`, params);

      return {
        swapData: res.contractCallParams[3].swapData as SwapData,
        minTokenOut: BigInt(res.contractCallParams[3].minTokenOut),
        pendleSwap: res.contractCallParams[3].pendleSwap,
        tokenRedeemSy: res.contractCallParams[3].tokenRedeemSy,
        limitOrderData: {
          limitRouter: "0x0000000000000000000000000000000000000000",
          epsSkipMarket: "0",
          normalFills: [],
          flashFills: [],
          optData: "0x",
        },
      };
    }
  } else {
    const params = {
      tokenIn: collateralToken.address,
      tokenOut: collateralToken.loanToken.address,
      amountIn,
    };

    const data = await callKyberSDK(chainId, flashLeverage.address, params);

    return {
      swapData: data.swapData,
      minTokenOut: data.minTokenOut,
      pendleSwap: zeroAddress,
      tokenRedeemSy: zeroAddress,
      limitOrderData: createDefaultLimitOrderData(),
    };
  }
}
