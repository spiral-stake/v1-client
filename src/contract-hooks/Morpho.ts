import { Base } from "./Base";
import { abi as MORPHO_ABI } from "../abi/IMorpho.sol/IMorpho.json";

// Needs to change for multi-chain implementation
const morphoAddress = "0x1bF0c2541F820E775182832f06c0B7Fc27A25f67";

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
