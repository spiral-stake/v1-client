import axios from "axios";
import { chainConfig } from "../config/chainConfig";
import { getTokens } from "./getTokens.ts";
import { addTokenToWallet } from "./addTokensToWallet.ts";
import { readCollateralTokens, readfrxUSD, readStblUSD } from "../config/contractsData.ts";

const amountCollateralTokens = "10000";

export const onboard = async (chainId: number, userAddress: string) => {
  const amountNative = chainConfig[chainId].onboard.amountNative;

  await axios.post(chainConfig[chainId].api + "/onboard", {
    userAddress,
    amountNative,
    amountCollateralTokens,
  });

  const [collateralTokens, frxUSD, stblUSD] = await Promise.all([
    readCollateralTokens(chainId),
    readfrxUSD(chainId),
    readStblUSD(chainId),
  ]);

  return [...collateralTokens, frxUSD, stblUSD].map((token) => addTokenToWallet(token));
};
