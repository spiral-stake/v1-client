import BigNumber from "bignumber.js";
import { CollateralToken, Token } from "../types";

interface CollateralTokensObject {
  [symbol: string]: CollateralToken;
}

interface TokenData {
  [symbol: string]: {
    image: string;
    apy: string;
  };
}

export const readCollateralTokens = async (chainId: number): Promise<CollateralToken[]> => {
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

export const readStblUSD = async (chainId: number): Promise<Token> => {
  const [addressesModule] = await Promise.all([
    import(`../addresses/${chainId}.json`) as Promise<{
      default: { stblUSD: Token };
    }>,
    import(`../token-data/${chainId}.json`) as Promise<{ default: TokenData }>,
  ]);

  const { stblUSD } = addressesModule.default;

  return {
    ...stblUSD,
  };
};

export const readToken = async (chainId: number, symbol: string): Promise<Token> => {
  const [addressesModule] = await Promise.all([
    import(`../addresses/${chainId}.json`) as Promise<{
      default: Record<string, Token>;
    }>,
    import(`../token-data/${chainId}.json`) as Promise<{ default: any }>,
  ]);

  const token = addressesModule.default[symbol];

  if (!token) {
    throw new Error(`Token with symbol ${symbol} not found for chainId ${chainId}`);
  }

  return token;
};

export const readCollateralToken = async (
  chainId: number,
  tokenAddress: string
): Promise<CollateralToken> => {
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
