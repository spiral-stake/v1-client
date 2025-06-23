import BigNumber from "bignumber.js";

export interface Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  valueInUsd: BigNumber;
  apy: string;
  isPT: boolean;
}

export interface Position {
  id: number;
  owner: string;
  collateralToken: Token;
  collateralDeposited: BigNumber;
  stblUSDMinted: BigNumber;
  collateralValueInUsd: BigNumber;
  ltv?: BigNumber;
  borrowApy: BigNumber;
}

export interface LeveragePosition {
  owner: string;
  id: number; // user => LeveragePosition[index]
  debtPosition: Position;
  userCollateralDeposited: BigNumber;
  userCollateralDepositedValueInUsd: BigNumber;
}
