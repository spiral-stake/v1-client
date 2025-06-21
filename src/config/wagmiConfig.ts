import { http } from "wagmi";
import { anvil, fraxtalTestnet, arbitrumSepolia } from "wagmi/chains";
import { chainConfig } from "./chainConfig";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

export const wagmiConfig = getDefaultConfig({
  appName: "Spiral Stake",
  projectId: "49bdf41453b575598177350acab135bd",
  chains: [arbitrumSepolia],
  transports: {
    // [2522]: http(chainConfig[2522]?.rpcUrls.default.http[0]),
    // [31337]: http("http://127.0.0.1:8545"),
    [421614]: http("https://sepolia-rollup.arbitrum.io/rpc"),
  },
});
