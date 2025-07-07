import axios from "axios";
import { chainConfig } from "../config/chainConfig.ts";
import { addTokenToWallet } from "./addTokensToWallet.ts";
import { readCollateralTokens, readToken } from "../config/contractsData.ts";

const amountCollateralTokens = "10000";

export const onboard = async (chainId: number, userAddress: string) => {
  const amountNative = chainConfig[chainId].onboard.amountNative;

  await axios.post(chainConfig[chainId].api + "/onboard", {
    userAddress,
    amountNative,
    amountCollateralTokens,
  });

  const [collateralTokens] = await Promise.all([readCollateralTokens(chainId)]);

  return [...collateralTokens].map((token) => addTokenToWallet(token));
};
