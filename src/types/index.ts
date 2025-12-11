import BigNumber from "bignumber.js";

export interface Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  valueInUsd: BigNumber;
  coingeckoId?: string;
}

export interface CollateralToken extends Token {
  apy: string;
  borrowApy: string;
  loanToken: Token;
  valueInLoanToken: BigNumber;
  liquidityAssets: BigNumber;
  safeLtv: string;
  maxLtv: string;
  liqLtv: string;
  defaultLeverage: string;
  defaultLeverageApy: string;
  morphoMarketId: string;
  info: TokenInfo;
  isPt: boolean;

  // Pendle Specific
  pendleMarket: string;
  YT: string;
  symbolExtended: string;
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
  id: number; // user => LeveragePosition[index]
  open: boolean;
  owner: string;
  liquidated: boolean;
  userProxy: string;
  collateralToken: CollateralToken;
  amountCollateral: BigNumber;
  amountLeveragedCollateral: BigNumber;
  sharesBorrowed: bigint;
  amountLoan: BigNumber;
  ltv: string;
  amountCollateralInLoanToken: BigNumber;
  amountDepositedInLoanToken: BigNumber;
  leverage: string;
  positionValueInLoanToken: BigNumber;
  leverageApy: string;
  yieldGenerated: BigNumber;
  // Server related
  openedOn: Number;
  heldFor: Number;
}

export interface ExternalSwapData {
  swapData: SwapData;
  minTokenOut: bigint;
  // Pendle specific
  pendleSwap: string;
  approxParams: any;
  tokenMintSy: string;
  limitOrderData: any;
}

export interface LeverageSwapData {
  swapData: SwapData;
  minTokenOut: bigint;
  // Pendle specific
  pendleSwap: string;
  approxParams: any;
  tokenMintSy: string;
  limitOrderData: any;
}

export interface DeleverageSwapData {
  swapData: SwapData;
  minTokenOut: bigint;
  // Pendle specific
  pendleSwap: string;
  tokenRedeemSy: string;
  limitOrderData: any;
}

export interface SwapData {
  swapType: number;
  extRouter: string;
  extCalldata: string;
  needScale: boolean;
}
