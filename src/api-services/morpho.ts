import BigNumber from "bignumber.js";
import { CollateralToken } from "./../types/index";
import axios from "axios";
import { formatUnits } from "../utils/formatUnits";
import { isMatured } from "../utils";

export const getMarketData = async (chainId: number, collateralToken: CollateralToken) => {
  if (chainId === 31337) chainId = 1;
  if (isMatured(collateralToken))
    return { borrowApy: BigNumber(0).toFixed(2), liquidityAssetsUsd: 0 };

  const query = `
    query {
      marketByUniqueKey(
        uniqueKey: "${collateralToken.morphoMarketId}"
        chainId: ${chainId}
      ) {
        state {
          borrowApy
          avgBorrowApy
          liquidityAssets
        }
        publicAllocatorSharedLiquidity {
          assets
          id
        }
      }
    }
  `;

  const { data } = (await axios.post("https://api.morpho.org/graphql", { query })).data;

  let liquidityAssetsUsd = 0;
  liquidityAssetsUsd += data.marketByUniqueKey.state.liquidityAssets;

  // // Public Allocater shared liquidity
  // data.marketByUniqueKey.publicAllocatorSharedLiquidity.forEach((pa: any) => {
  //   liquidityAssetsUsd += pa.assets;
  // });

  liquidityAssetsUsd = formatUnits(
    BigInt(liquidityAssetsUsd),
    collateralToken.loanToken.decimals
  ).toNumber();

  const borrowApy = Math.min(
    data.marketByUniqueKey.state.avgBorrowApy,
    data.marketByUniqueKey.state.borrowApy
  ); // Need to cross verify

  return { borrowApy: BigNumber(borrowApy * 100).toFixed(2), liquidityAssetsUsd };
};
