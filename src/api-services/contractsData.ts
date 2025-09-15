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
  const [addressesModule] = await Promise.all([
    import(`../addresses/${chainId}.json`) as Promise<{
      default: { collateralTokens: CollateralTokensObject };
    }>,
  ]);

  const { collateralTokens } = addressesModule.default;

  return Object.keys(collateralTokens).map((tokenAddress) => {
    return {
      ...collateralTokens[tokenAddress],
    };
  });
};

export const readToken = async (chainId: number, symbol: string): Promise<Token> => {
  const [addressesModule] = await Promise.all([
    import(`../addresses/${chainId}.json`) as Promise<{
      default: Record<string, Token>;
    }>,
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
  const [addressesModule] = await Promise.all([
    import(`../addresses/${chainId}.json`) as Promise<{
      default: { collateralTokens: CollateralTokensObject };
    }>,
  ]);

  const { collateralTokens } = addressesModule.default;

  return {
    ...collateralTokens[tokenAddress],
  };
};
