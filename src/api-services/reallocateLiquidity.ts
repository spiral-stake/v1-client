// External dependencies
import {
  createPublicClient,
  encodeAbiParameters,
  formatUnits,
  http,
  keccak256,
  parseAbiParameters,
  zeroAddress,
} from "viem";

// Morpho dependencies
import { BaseBundlerV2__factory } from "@morpho-org/morpho-blue-bundlers/types/index.js";
import { BundlerAction } from "@morpho-org/morpho-blue-bundlers/pkg/index.js";
import { mainnet } from "viem/chains";

// Define the structure of MarketParams and Withdrawal
interface MarketParams {
  loanToken: `0x${string}`;
  collateralToken: `0x${string}`;
  oracle: `0x${string}`;
  irm: `0x${string}`;
  lltv: bigint;
}

interface Withdrawal {
  marketParams: MarketParams;
  amount: bigint;
}

// ✅ Constants — Mainnet Only
const SUPPORTED_CHAIN_ID = 1 as const;
const API_URL = "https://blue-api.morpho.org/graphql" as const;
const BASE_BUNDLER_V2_ADDRESS = "0x4095F064B8d3c3548A3bebfd0Bbfd04750E30077" as const;

// ✅ Helper: Ensure only chain 1
function ensureMainnet(chainId: number): asserts chainId is 1 {
  if (chainId !== SUPPORTED_CHAIN_ID) {
    throw new Error(
      `Unsupported chain: ${chainId}. Only Ethereum Mainnet (chainId = 1) is supported.`
    );
  }
}

// ✅ GraphQL Queries
const queries = {
  query1: `
    query PublicAllocators($chainId: Int!) {
      publicAllocators(where: { chainId_in: [$chainId] }) {
        items {
          address
        }
      }
    }
  `,
  query2: `
    query MarketByUniqueKey($uniqueKey: String!, $chainId: Int!) {
      marketByUniqueKey(uniqueKey: $uniqueKey, chainId: $chainId) {
        reallocatableLiquidityAssets
        loanAsset { address decimals priceUsd }
        state { liquidityAssets }
        publicAllocatorSharedLiquidity {
          assets
          vault { address name }
          allocationMarket {
            uniqueKey
            loanAsset { address }
            collateralAsset { address }
            irmAddress
            oracle { address }
            lltv
          }
        }
        collateralAsset { address decimals priceUsd }
        oracle { address }
        irmAddress
        lltv
      }
    }
  `,
};

// ✅ Initialize viem client (Mainnet Only)
async function initializeClient(chainId: number) {
  ensureMainnet(chainId);

  const rpcUrl = `https://mainnet.infura.io/v3/${import.meta.env.VITE_INFURA_ID}`;
  if (!rpcUrl) throw new Error(`Missing RPC URL for mainnet.`);

  const client = createPublicClient({
    chain: mainnet,
    transport: http(rpcUrl, {
      retryCount: 3,
      retryDelay: 1000,
      timeout: 20000,
      batch: { batchSize: 100, wait: 20 },
    }),
    batch: { multicall: { batchSize: 2048, wait: 50 } },
  });

  return { client };
}

// ✅ Fetch API helper
export const fetchAPI = async <T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  return response.json() as Promise<T>;
};

// ✅ Query allocator
export const queryPublicAllocatorAddress = async (chainId: number): Promise<string> => {
  ensureMainnet(chainId);
  const query = queries.query1;
  const data: any = await fetchAPI(query, { chainId });
  return data?.data?.publicAllocators?.items?.[0]?.address || "";
};

// ✅ Query market data
export const queryMarketData = async (uniqueKey: string, chainId: number): Promise<any> => {
  ensureMainnet(chainId);
  const query = queries.query2;
  const data: any = await fetchAPI(query, { uniqueKey, chainId });
  return data?.data?.marketByUniqueKey || {};
};

// ✅ Extract reallocation data
const extractDataForReallocation = (marketData: any) => {
  const withdrawalsPerVault: { [vaultAddress: string]: Withdrawal[] } = {};

  marketData.publicAllocatorSharedLiquidity.forEach((item: any) => {
    const withdrawal: Withdrawal = {
      marketParams: {
        loanToken: item.allocationMarket.loanAsset.address as `0x${string}`,
        collateralToken: item.allocationMarket.collateralAsset?.address || zeroAddress,
        oracle: item.allocationMarket.oracle?.address || zeroAddress,
        irm: item.allocationMarket.irmAddress || zeroAddress,
        lltv: item.allocationMarket.lltv,
      },
      amount: (BigInt(item.assets) * BigInt(999)) / BigInt(1000),
    };

    if (!withdrawalsPerVault[item.vault.address]) withdrawalsPerVault[item.vault.address] = [];
    withdrawalsPerVault[item.vault.address].push(withdrawal);
  });

  const supplyMarketParams: MarketParams = {
    loanToken: marketData.loanAsset.address as `0x${string}`,
    collateralToken: marketData.collateralAsset.address as `0x${string}`,
    oracle: marketData.oracle.address as `0x${string}`,
    irm: marketData.irmAddress,
    lltv: marketData.lltv,
  };

  return { withdrawalsPerVault, supplyMarketParams };
};

// ✅ Get Market ID
export const getMarketId = (market: MarketParams) => {
  const encodedMarket = encodeAbiParameters(
    parseAbiParameters("address, address, address, address, uint256"),
    [market.loanToken, market.collateralToken, market.oracle, market.irm, market.lltv]
  );
  return keccak256(encodedMarket);
};

// ✅ Process Withdrawals
const processWithdrawals = (
  withdrawalsPerVault: { [vaultAddress: string]: Withdrawal[] },
  liquidityToReallocate: bigint
) => {
  const processedWithdrawals: { [vaultAddress: string]: Withdrawal[] } = {};
  let remainingLiquidity = liquidityToReallocate;
  let totalReallocated = BigInt(0);

  for (const [vaultAddress, withdrawals] of Object.entries(withdrawalsPerVault)) {
    if (remainingLiquidity <= BigInt(0)) break;
    processedWithdrawals[vaultAddress] = [];

    for (const withdrawal of withdrawals) {
      if (remainingLiquidity <= BigInt(0)) break;

      const amountToWithdraw =
        withdrawal.amount > remainingLiquidity ? remainingLiquidity : withdrawal.amount;

      processedWithdrawals[vaultAddress].push({
        marketParams: withdrawal.marketParams,
        amount: amountToWithdraw,
      });

      totalReallocated += amountToWithdraw;
      remainingLiquidity -= amountToWithdraw;
    }

    if (processedWithdrawals[vaultAddress].length === 0) delete processedWithdrawals[vaultAddress];
  }

  return {
    processedWithdrawals,
    totalReallocated,
    remainingLiquidity,
    isLiquidityFullyMatched: remainingLiquidity <= 0n,
  };
};

// ✅ Simulate individual reallocations
async function simulateIndividualReallocations(
  client: any,
  bundlerAddress: `0x${string}`,
  publicAllocatorAddress: string,
  withdrawalsPerVault: { [vaultAddress: string]: Withdrawal[] },
  supplyMarketParams: MarketParams,
  simulationAccount?: `0x${string}`
) {
  const results: any[] = [];

  for (const [vaultAddress, withdrawals] of Object.entries(withdrawalsPerVault)) {
    for (const withdrawal of withdrawals) {
      try {
        const bundlerActions = [
          BundlerAction.metaMorphoReallocateTo(
            publicAllocatorAddress,
            vaultAddress,
            0n,
            [withdrawal],
            supplyMarketParams
          ),
        ];

        const accountToUse =
          simulationAccount ?? ("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" as `0x${string}`);

        const { result } = await client.simulateContract({
          address: bundlerAddress,
          abi: BaseBundlerV2__factory.abi,
          functionName: "multicall",
          args: [bundlerActions],
          account: accountToUse,
        });

        results.push({ success: true, vaultAddress, withdrawals: [withdrawal], result });
      } catch (error) {
        results.push({
          success: false,
          vaultAddress,
          withdrawals: [withdrawal],
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  return results;
}

// ✅ Main Function
const reallocateRequestedLiquidity = async (
  marketId: string,
  chainId: number,
  liquidityToBeBorrowed: bigint
) => {
  ensureMainnet(chainId);

  console.log(`\nRequested ${requestedLiquidityNativeUnits} of loan asset on chain ${chainId}`);

  const publicAllocatorAddress = await queryPublicAllocatorAddress(chainId);
  if (!publicAllocatorAddress) throw new Error(`Public Allocator Address not found.`);

  const marketData = await queryMarketData(marketId, chainId);
  if (!marketData) throw new Error("Market data not found.");

  const currentMarketLiquidity = BigInt(marketData.state.liquidityAssets);

  if (liquidityToBeBorrowed < currentMarketLiquidity) {
    console.log(`Enough liquidity available — no reallocation needed.`);
    return;
  }

  const liquidityToReallocate = liquidityToBeBorrowed - currentMarketLiquidity;
  console.log(
    `Liquidity to reallocate: ${formatUnits(liquidityToReallocate, marketData.loanAsset.decimals)}`
  );

  const { withdrawalsPerVault, supplyMarketParams } = extractDataForReallocation(marketData);
  const { client } = await initializeClient(chainId);
  const simulationResults = await simulateIndividualReallocations(
    client,
    BASE_BUNDLER_V2_ADDRESS,
    publicAllocatorAddress,
    withdrawalsPerVault,
    supplyMarketParams
  );

  console.log("\nSimulation complete:", simulationResults.length, "cases");
};

// ✅ Entry Point
const chainId = 1; // ⚡ Mainnet only
const marketId = "0xcf90e73ee616097c10278bfedc410a1addc3fd4c5c80b93ef248b91bbd4c062c";
const requestedLiquidityNativeUnits = BigInt(20000000000000); // 20M USDC

// Execute
reallocateRequestedLiquidity(marketId, chainId, requestedLiquidityNativeUnits).catch(console.error);
