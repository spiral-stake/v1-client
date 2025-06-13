import axios from "axios";
import { chainConfig } from "../config/chainConfig";
import { getTokens } from "./getTokens.ts";
import { addTokenToWallet } from "./addTokensToWallet.ts";

const amountYbt = "1000";
const amountBase = "1000";

export const onboard = async (chainId: number, userAddress: string) => {
  const amountNative = chainConfig[chainId].onboard.amountNative;

  await axios.post(chainConfig[chainId].api + "/onboard", {
    userAddress,
    amountNative,
    amountYbt,
    amountBase,
  });

  const { ybts, baseTokens } = await getTokens(chainId);
  const ybtPromises = ybts.map((ybt) => addTokenToWallet(ybt));
  const baseTokenPromises = baseTokens.map((baseToken) => addTokenToWallet(baseToken));
  await Promise.all([...ybtPromises, ...baseTokenPromises]);
};
