import { defineChain } from "viem";

const local = defineChain({
  id: 31337,
  name: "Local",
  nativeCurrency: { decimals: 18, name: "Ether", symbol: "ETH" },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"],
      webSocket: ["ws://127.0.0.1:8545"],
    },
  },
  logo: "/logos/mainnet.svg",
  api: "http://localhost:5000",
  onboard: { amountNative: "1" },
});

const ethereumMainnet = defineChain({
  id: 1,
  name: "Ethereum",
  logo: "/logos/mainnet.svg",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://eth.merkle.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://etherscan.io",
      apiUrl: "https://api.etherscan.io/api",
    },
  },
  contracts: {
    ensRegistry: { address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e" },
    ensUniversalResolver: {
      address: "0xce01f8eee7E479C928F8919abD53E553a36CeF67",
      blockCreated: 19_258_213,
    },
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 14_353_601,
    },
  },
});

// ===== Env-based Export ===== //
interface ChainType {
  [key: number]: ReturnType<typeof defineChain>;
}

const ENV = import.meta.env.VITE_ENV;

export const chainConfig: ChainType =
  ENV === "dev" ? { [local.id]: local } : { [ethereumMainnet.id]: ethereumMainnet };
