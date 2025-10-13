import { Base } from "./Base";
import { abi as MORPHO_ABI } from "../abi/IMorpho.sol/IMorpho.json";

// Needs to change for multi-chain implementation
const morphoAddress = "0xbbbbbbbbbb9cc5e90e3b3af64bdaf62c37eeffcb";

export default class Morpho extends Base {
  constructor() {
    super(morphoAddress, MORPHO_ABI);
  }

  ///////////////////////////
  // WRITE FUNCTIONS
  /////////////////////////

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
