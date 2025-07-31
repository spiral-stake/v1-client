import BigNumber from "bignumber.js";
import { CollateralToken } from "./../types/index";
import axios from "axios";

export const getBorrowApy = async (chainId: number, collateralToken: CollateralToken) => {
  if (chainId === 31337) chainId = 1;

  const query = `
    query {
      marketByUniqueKey(
        uniqueKey: "${collateralToken.morphoMarketId}"
        chainId: ${chainId}
      ) {
        state {
          borrowApy
        }
      }
    }
  `;

  const { data } = (await axios.post("https://api.morpho.org/graphql", { query })).data;
  const borrowApy = data.marketByUniqueKey.state.borrowApy;
  return BigNumber(borrowApy * 100).toFixed(2);
};
