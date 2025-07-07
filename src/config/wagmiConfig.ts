import { http } from "wagmi";
import { anvil, fraxtalTestnet, arbitrumSepolia, base } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

export const wagmiConfig = getDefaultConfig({
  appName: "Spiral Stake",
  projectId: "49bdf41453b575598177350acab135bd",
  chains: [base],
  transports: {
    // [2522]: http(chain[2522]?.rpcUrls.default.http[0]),
    // [31337]: http("http://127.0.0.1:8545"),
    // [421614]: http("https://sepolia-rollup.arbitrum.io/rpc"),
    [8453]: http("https://mainnet.base.org"),
  },
});
