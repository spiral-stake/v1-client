import { Token } from "../types";

interface CollateralTokensObject {
  [symbol: string]: Token;
}

export const readCollateralTokens = async (chainId: number): Promise<Token[]> => {
  const { collateralTokens: collateralTokensObj } = (await import(
    `../addresses/${chainId}.json`
  )) as {
    collateralTokens: CollateralTokensObject;
  };

  return Object.values(collateralTokensObj);
};

export const readCollateralToken = async (
  chainId: number,
  tokenAddress: string
): Promise<Token> => {
  const { collateralTokens } = await import(`../addresses/${chainId}.json`);
  console.log(collateralTokens[tokenAddress]);
  return { ...collateralTokens[tokenAddress] };
};
