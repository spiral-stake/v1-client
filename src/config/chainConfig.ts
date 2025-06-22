import { defineChain } from "../../node_modules/viem/utils/chain/defineChain.ts";

const fraxtalLocal: any = defineChain({
  id: 31337,
  name: "Frax Local",
  nativeCurrency: {
    decimals: 18,
    name: "Frax Ether",
    symbol: "frxETH",
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"],
      webSocket: ["ws://127.0.0.1:8545"],
    },
  },
  logo: "/logo/reya-logo.webp",
  api: "http://localhost:5000",
  onboard: {
    amountNative: "1",
  },
});

const fraxtalTestnet: any = defineChain({
  id: 2522,
  name: "Fraxtal Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Frax Share",
    symbol: "FRAX",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.frax.com"],
    },
  },
  logo: "/logos/frax.svg",
  api: "https://api.spiralstake.xyz",
  onboard: {
    amountNative: "0.0001",
  },
});

const arbitrumTestnet: any = defineChain({
  id: 421614,
  name: "Arbitrum Sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://sepolia-rollup.arbitrum.io/rpc"],
    },
  },
  blockExplorers: {
    default: {
      name: "Arbiscan",
      url: "https://sepolia.arbiscan.io",
      apiUrl: "https://api-sepolia.arbiscan.io/api",
    },
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 81930,
    },
  },
  testnet: true,
  logo: "/logo/arb-logo.png",
  api: "http://localhost:5000",
  onboard: {
    amountNative: "0.001",
  },
});

interface ChainConfigType {
  [key: number]: any;
}

export const chainConfig: ChainConfigType = {
  // 31337: fraxtalLocal,
  // 31338: arbitrumLocal,
  // 2522: fraxtalTestnet,
  421614: arbitrumTestnet,
};
