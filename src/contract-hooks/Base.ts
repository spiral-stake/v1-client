import {
  readContract,
  writeContract,
  simulateContract,
  getAccount,
  waitForTransactionReceipt,
  getBalance,
  getPublicClient,
} from "wagmi/actions";
import { wagmiConfig as config } from "../config/wagmiConfig.ts";
import { formatUnits } from "../utils/formatUnits.ts";
import { decodeEventLog } from "viem";
const { connector } = getAccount(config);

export class Base {
  address: `0x${string}`;
  abi: any[];

  constructor(address: string, abi: any[]) {
    this.address = address as `0x${string}`;
    this.abi = abi;
  }

  async read<T = unknown>(functionName: string, args: any[] = []): Promise<T> {
    const res = await readContract(config, {
      abi: this.abi,
      address: this.address,
      functionName,
      args,
    });

    return res as T;
  }

  async simulate(functionName: string, args: any[] = [], value: bigint = 0n) {
    const account = ((await connector?.getAccounts()) as string[])?.[0] as `0x${string}`;

    return await simulateContract(config, {
      abi: this.abi,
      address: this.address,
      functionName: functionName,
      args,
      account,
      value,
    });
  }

  async write(functionName: string, args: any[] = [], value: bigint = 0n) {
    const { maxFeePerGas, maxPriorityFeePerGas } = await getPublicClient(
      config
    ).estimateFeesPerGas();

    const { request } = await this.simulate(functionName, args, value);

    const hash = await writeContract(config, { ...request, maxFeePerGas, maxPriorityFeePerGas });

    return waitForTransactionReceipt(config, { hash, confirmations: 1 });
  }

  async getNativeBalance(account: string) {
    const { value } = await getBalance(config, {
      address: account as `0x${string}`,
    });

    return formatUnits(value, 18);
  }

  decodeEvent = (txReceipt: any, eventName: string) => {
    const log = txReceipt.logs.find(
      (log: any) => log.address.toLowerCase() === this.address.toLowerCase()
    );

    if (!log) return;

    return decodeEventLog({
      abi: this.abi,
      eventName,
      topics: log.topics,
    }).args;
  };
}
