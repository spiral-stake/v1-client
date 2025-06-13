import {
  readContract,
  writeContract,
  simulateContract,
  getAccount,
  waitForTransactionReceipt,
  getBalance,
} from "wagmi/actions";
import { wagmiConfig as config } from "../config/wagmiConfig.ts";
import { formatUnits } from "../utils/formatUnits.ts";
import { wait } from "../utils/time.ts";
const { connector } = getAccount(config);

export class Base {
  address: `0x${string}`;
  abi: any[];

  constructor(address: string, abi: any[]) {
    this.address = address as `0x${string}`;
    this.abi = abi;
  }

  async read<T = unknown>(functionName: string, args: any[] = [], chainId?: number): Promise<T> {
    const res = await readContract(config, {
      abi: this.abi,
      address: this.address,
      functionName,
      args,
      chainId: chainId as 2522 | undefined,
    });

    // await wait(2);

    return res as T;
  }

  async simulate(functionName: string, args: any[] = [], value: bigint = 0n, chainId?: number) {
    return (
      await simulateContract(config, {
        abi: this.abi,
        address: this.address,
        functionName: functionName,
        args,
        account:
          (await connector?.getAccounts?.())?.[0] ||
          ("0x0000000000000000000000000000000000000000" as `0x${string}`),
        value,
        chainId: chainId as 2522 | undefined,
      })
    ).result;
  }

  async write(functionName: string, args: any[] = [], value: bigint = 0n) {
    const hash = await writeContract(config, {
      abi: this.abi,
      address: this.address,
      functionName,
      args,
      value,
      __mode: "prepared", // Needs to be uncommented on local
    });

    await wait(4);

    return waitForTransactionReceipt(config, { hash, confirmations: 1 });
  }

  async getNativeBalance(account: string) {
    const { value } = await getBalance(config, {
      address: account as `0x${string}`,
    });

    return formatUnits(value, 18);
  }
}
