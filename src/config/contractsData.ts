import { Token } from "../types";

interface CollateralTokensObject {
  [symbol: string]: Token;
}

export const readCollateralTokens = async (chainId: number): Promise<Token[]> => {
  console.log(chainId);
  const { collateralTokens: collateralTokensObj } = (await import(
    `../addresses/${chainId}.json`
  )) as {
    collateralTokens: CollateralTokensObject;
  };

  return Object.values(collateralTokensObj);
};

export const readCollateralToken = async (chainId: number, tokenSymbol: string): Promise<Token> => {
  const { collateralTokens: collateralTokensObj } = await import(`../addresses/${chainId}.json`);
  return { ...collateralTokensObj[tokenSymbol] };
};
