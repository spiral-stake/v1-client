import { Base } from "./Base";
import { abi as USER_PROXY } from "../abi/UserProxy.sol/UserProxy.json";

// Needs to change for multi-chain implementation

export default class UserProxy extends Base {
  constructor(userProxy: string) {
    super(userProxy, USER_PROXY);
  }

  ///////////////////////////
  // WRITE FUNCTIONS
  /////////////////////////

  async execute(callData: string) {
    await this.write("execute", [callData]);
  }

  ///////////////////////////
  // READ FUNCTIONS
  /////////////////////////

  async position(morphoMarketId: string, userProxy: string) {
    const { borrowShares, collateral } = (await this.read("position", [
      morphoMarketId,
      userProxy,
    ])) as {
      borrowShares: bigint;
      collateral: bigint;
    };

    return { borrowShares, collateral };
  }
}
