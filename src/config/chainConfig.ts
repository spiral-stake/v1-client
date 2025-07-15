import { defineChain } from "../../node_modules/viem/utils/chain/defineChain.ts";
import { chainConfig as opChainConfig } from "../../node_modules/viem/op-stack/chainConfig.ts";

const local: any = defineChain({
  id: 31337,
  name: "Local",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"],
      webSocket: ["ws://127.0.0.1:8545"],
    },
  },
  logo: "/logos/base.svg",
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
  logo: "/logos/arb.svg",
  api: "https://api.spiralstake.xyz",
  onboard: {
    amountNative: "0.001",
  },
});

const sourceId = 1; // mainnet
const baseMainnet: any = defineChain({
  ...opChainConfig,
  id: 8453,
  name: "Base",
  logo: "/logos/base.svg",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet.base.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "Basescan",
      url: "https://basescan.org",
      apiUrl: "https://api.basescan.org/api",
    },
  },

  contracts: {
    ...opChainConfig.contracts,
    disputeGameFactory: {
      [sourceId]: {
        address: "0x43edB88C4B80fDD2AdFF2412A7BebF9dF42cB40e",
      },
    },
    l2OutputOracle: {
      [sourceId]: {
        address: "0x56315b90c40730925ec5485cf004d835058518A0",
      },
    },
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 5022,
    },
    portal: {
      [sourceId]: {
        address: "0x49048044D57e1C92A77f79988d21Fa8fAF74E97e",
        blockCreated: 17482143,
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: "0x3154Cf16ccdb4C6d922629664174b904d80F2C35",
        blockCreated: 17482143,
      },
    },
  },
  sourceId,
});

interface chainType {
  [key: number]: any;
}

export const chainConfig: chainType = {
  31337: local,
  // 31338: arbitrumLocal,
  // 2522: fraxtalTestnet,
  // 421614: arbitrumTestnet,
  // 8453: baseMainnet,
};
