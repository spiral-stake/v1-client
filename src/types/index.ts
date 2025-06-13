import BigNumber from "bignumber.js";

export interface Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  valueInUsd: BigNumber;
}

export interface Position {
  collateralToken: Token;
  collateralDeposited: BigNumber;
  collateralValueInUsd: BigNumber;
  spiUsdMinted: BigNumber;
  ltv?: BigNumber;
}
