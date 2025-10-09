import { CollateralToken, Token, TokenInfo } from "../types";
import { getMaturityDate, getMaturityDaysLeft } from "../utils";

interface CollateralTokensObject {
  [symbol: string]: CollateralToken;
}

export const readCollateralTokens = async (chainId: number): Promise<CollateralToken[]> => {
  const [addressesModule, tokenInfoModule] = await Promise.all([
    import(`../addresses/${chainId}.json`) as Promise<{
      default: { collateralTokens: CollateralTokensObject };
    }>,
    import(`./tokenInfo.json`) as Promise<{
      default: Record<string, TokenInfo>;
    }>,
  ]);

  const { collateralTokens } = addressesModule.default;
  const tokenInfo = tokenInfoModule.default;

  return Object.keys(collateralTokens).map((tokenAddress) => {
    const collateralToken = collateralTokens[tokenAddress];
    const maturityDate = getMaturityDate(collateralToken.symbol);

    return {
      ...collateralToken,
      symbolExtended: collateralToken.symbol,
      symbol: `${collateralToken.symbol.split("-")[0]}-${collateralToken.symbol.split("-")[1]}`,
      maturityDate,
      maturityDaysLeft: getMaturityDaysLeft(maturityDate),
      info: tokenInfo[tokenAddress],
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
  const [addressesModule, tokenInfoModule] = await Promise.all([
    import(`../addresses/${chainId}.json`) as Promise<{
      default: { collateralTokens: CollateralTokensObject };
    }>,
    import(`./tokenInfo.json`) as Promise<{
      default: Record<string, TokenInfo>;
    }>,
  ]);

  const { collateralTokens } = addressesModule.default;
  const tokenInfo = tokenInfoModule.default;

  const collateralToken = collateralTokens[tokenAddress];
  const maturityDate = getMaturityDate(collateralToken.symbol);

  return {
    ...collateralToken,
    symbolExtended: collateralToken.symbol,
    symbol: `${collateralToken.symbol.split("-")[0]}-${collateralToken.symbol.split("-")[1]}`,
    maturityDate,
    maturityDaysLeft: getMaturityDaysLeft(maturityDate),
    info: tokenInfo[tokenAddress],
  };
};
