import BigNumber from "bignumber.js";

export interface Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  valueInUsd: BigNumber;
}

export interface Position {
  id: number;
  owner: string;
  collateralToken: Token;
  collateralDeposited: BigNumber;
  spiUsdMinted: BigNumber;
  collateralValueInUsd: BigNumber;
  ltv?: BigNumber;
}
