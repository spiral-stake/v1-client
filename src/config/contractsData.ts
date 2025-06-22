import { Token } from "../types";

interface CollateralTokensObject {
  [symbol: string]: Token;
}

interface TokenData {
  [symbol: string]: {
    isPT: boolean;
    apy: string;
  };
}

export const readCollateralTokens = async (chainId: number): Promise<Token[]> => {
  const [addressesModule, tokenDataModule] = await Promise.all([
    import(`../addresses/${chainId}.json`) as Promise<{
      default: { collateralTokens: CollateralTokensObject };
    }>,
    import(`../token-data/${chainId}.json`) as Promise<{ default: TokenData }>,
  ]);

  const { collateralTokens } = addressesModule.default;
  const tokenData = tokenDataModule.default;

  return Object.keys(collateralTokens).map((tokenAddress) => {
    return {
      ...collateralTokens[tokenAddress],
      ...tokenData[tokenAddress],
    };
  });
};

export const readSpiUsd = async (chainId: number): Promise<Token> => {
  const [addressesModule] = await Promise.all([
    import(`../addresses/${chainId}.json`) as Promise<{
      default: { SPIUSD: Token };
    }>,
    import(`../token-data/${chainId}.json`) as Promise<{ default: TokenData }>,
  ]);

  const { SPIUSD } = addressesModule.default;

  return {
    ...SPIUSD,
    isPT: false,
    apy: "0",
  };
};

export const readCollateralToken = async (
  chainId: number,
  tokenAddress: string
): Promise<Token> => {
  const [addressesModule, tokenDataModule] = await Promise.all([
    import(`../addresses/${chainId}.json`) as Promise<{
      default: { collateralTokens: CollateralTokensObject };
    }>,
    import(`../token-data/${chainId}.json`) as Promise<{ default: TokenData }>,
  ]);

  const { collateralTokens } = addressesModule.default;
  const tokenData = tokenDataModule.default;

  return {
    ...collateralTokens[tokenAddress],
    ...tokenData[tokenAddress],
  };
};
