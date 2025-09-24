import { http } from "wagmi";
import { anvil, mainnet } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

// Detect environment
const isProd = import.meta.env.VITE_ENV === "prod";

// Base transports object
const transports: Record<number, ReturnType<typeof http>> = {};

// Assign depending on env
if (isProd) {
  transports[mainnet.id] = http(`https://mainnet.infura.io/v3/${import.meta.env.VITE_INFURA_ID}`);
} else {
  transports[anvil.id] = http("http://127.0.0.1:8545");
}

// Final wagmi config
export const wagmiConfig = getDefaultConfig({
  appName: "Spiral Stake",
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  chains: isProd ? [mainnet] : [anvil],
  transports,
});
