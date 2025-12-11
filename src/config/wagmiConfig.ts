import { http } from "wagmi";
import { anvil, mainnet, polygon } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

// Detect environment
const isProd = import.meta.env.VITE_ENV === "prod";

// Base transports object
const transports: Record<number, ReturnType<typeof http>> = {};

// Assign depending on env
if (isProd) {
  const infuraId = import.meta.env.VITE_INFURA_ID;
  if (infuraId) {
    transports[mainnet.id] = http(`https://mainnet.infura.io/v3/${infuraId}`);
    transports[polygon.id] = http(`https://polygon-mainnet.infura.io/v3/${infuraId}`);
  } else {
    transports[mainnet.id] = http(mainnet.rpcUrls.default.http[0]);
    transports[polygon.id] = http(polygon.rpcUrls.default.http[0]);
  }
} else {
  // Temp
  transports[mainnet.id] = http(`https://mainnet.infura.io/v3/864733c97d574e199e6d10220c272f10`);
  transports[anvil.id] = http("http://127.0.0.1:8545");
}

// Final wagmi config
export const wagmiConfig = getDefaultConfig({
  appName: "Spiral Stake",
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  chains: isProd ? [polygon, mainnet] : [anvil, polygon],
  transports,
});
