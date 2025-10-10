import BigNumber from "bignumber.js";
import { CollateralToken } from "./../types/index";
import axios from "axios";
import { formatUnits } from "../utils/formatUnits";

export const getMarketData = async (chainId: number, collateralToken: CollateralToken) => {
  if (chainId === 31337) chainId = 1;

  const query = `
    query {
      marketByUniqueKey(
        uniqueKey: "${collateralToken.morphoMarketId}"
        chainId: ${chainId}
      ) {
        state {
          avgBorrowApy
          liquidityAssetsUsd
        }
      }
    }
  `;

  const { data } = (await axios.post("https://api.morpho.org/graphql", { query })).data;

  const liquidityAssetsUsd = data.marketByUniqueKey.state.liquidityAssetsUsd as number;

  const borrowApy = data.marketByUniqueKey.state.avgBorrowApy;
  return { borrowApy: BigNumber(borrowApy * 100).toFixed(2), liquidityAssetsUsd };
};