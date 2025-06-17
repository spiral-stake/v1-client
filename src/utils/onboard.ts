import axios from "axios";
import { chainConfig } from "../config/chainConfig";
import { getTokens } from "./getTokens.ts";
import { addTokenToWallet } from "./addTokensToWallet.ts";
import { readCollateralTokens } from "../config/contractsData.ts";

const amountCollateralTokens = "10000";

export const onboard = async (chainId: number, userAddress: string) => {
  const amountNative = chainConfig[chainId].onboard.amountNative;

  await axios.post(chainConfig[chainId].api + "/onboard", {
    userAddress,
    amountNative,
    amountCollateralTokens,
  });

  const collateralTokens = await readCollateralTokens(chainId);
  return collateralTokens.map((collateralToken) => addTokenToWallet(collateralToken));
};
