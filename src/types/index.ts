import BigNumber from "bignumber.js";

export interface Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  valueInUsd: BigNumber;
}

export interface CollateralToken extends Token {
  symbolExtended: string;
  impliedApy: string;
  borrowApy: string;
  liquidityAssetsUsd: number;
  safeLtv: string;
  maxLtv: string;
  liqLtv: string;
  defaultLeverage: string;
  defaultLeverageApy: string;
  morphoMarketId: string;
  pendleMarket: string;
  loanToken: Token;
  info: TokenInfo;
  YT: string;
  maturityTimestamp: number;
  maturityDate: string;
  maturityDaysLeft: number;
}

export interface TokenInfo {
  underlyingCollateral: string;
  yieldSource: string;
  riskProfile: string;
}

export interface LeveragePosition {
  open: boolean;
  owner: string;
  id: number; // user => LeveragePosition[index]
  collateralToken: CollateralToken;
  amountCollateral: BigNumber;
  amountLeveragedCollateral: BigNumber;
  sharesBorrowed: bigint;
  amountLoan: BigNumber;
  amountYield: BigNumber;
  ltv: string;
  amountCollateralInLoanToken: BigNumber;
  impliedApy: string;
}

export interface InternalSwapData {
  approxParams: any;
  pendleSwap: string;
  tokenMintSy: string;
  minPtOut: bigint;
  swapData: any;
  limitOrderData: any;
}

export interface InternalReswapData {
  pendleSwap: string;
  tokenRedeemSy: string;
  minTokenOut: bigint;
  swapData: any;
  limitOrderData: any;
}

/////////////////
// Miscellaneous
////////////////

export type SwapData = { amountOut: string; priceImpact: number };
export type AddLiquidityData = { amountLpOut: string; amountYtOut: string; priceImpact: number };
export type AddLiquidityDualData = { amountOut: string; priceImpact: number };
export type RemoveLiquidityData = { amountOut: string; priceImpact: number };
export type RemoveLiquidityDualData = {
  amountTokenOut: string;
  amountPtOut: string;
  priceImpact: number;
};
export type MintPyData = { amountOut: string; priceImpact: number };
export type MintSyData = { amountOut: string; priceImpact: number };
export type RedeemPyData = { amountOut: string; priceImpact: number };
export type RedeemSyData = { amountOut: string; priceImpact: number };
export type TransferLiquidityData = {
  amountLpOut: string;
  amountYtOut: string;
  priceImpact: number;
};
export type RollOverPtData = { amountPtOut: string; priceImpact: number };

export interface LimitOrderResponse {
  /** Hash of the order */
  id: string;
  /** Signature of order, signed by maker */
  signature: string;
  /** Chain id */
  chainId: number;
  /** BigInt string of salt */
  salt: string;
  /** BigInt string of expiry, in second */
  expiry: string;
  /** BigInt string of nonce */
  nonce: string;
  /** LimitOrderType { 0 : TOKEN_FOR_PT, 1 : PT_FOR_TOKEN, 2 : TOKEN_FOR_YT, 3 : YT_FOR_TOKEN } */
  type: 0 | 1 | 2 | 3;
  /** Token used by user to make order */
  token: string;
  /** YT address */
  yt: string;
  /** Maker address */
  maker: string;
  /** Receiver address */
  receiver: string;
  /** BigInt string of making amount, the amount of token if the order is TOKEN_FOR_PT or TOKEN_FOR_YT, otherwise the amount of PT or YT */
  makingAmount: string;
  /** BigInt string of remaining making amount, the unit is the same as makingAmount */
  lnImpliedRate: string;
  /** BigInt string of failSafeRate */
  failSafeRate: string;
  /** Bytes string for permit */
  permit: string;
}
