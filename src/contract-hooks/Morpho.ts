import { Base } from "./Base";
import { abi as MORPHO_ABI } from "../abi/IMorpho.sol/IMorpho.json";
import { CollateralToken, LeveragePosition } from "../types";
import { parseUnits } from "../utils/formatUnits";
import { encodeFunctionData } from "viem";
import BigNumber from "bignumber.js";

// Needs to change for multi-chain implementation
const morphoAddress = "0xbbbbbbbbbb9cc5e90e3b3af64bdaf62c37eeffcb";

export default class Morpho extends Base {
  constructor() {
    super(morphoAddress, MORPHO_ABI);
  }

  ///////////////////////////
  // WRITE FUNCTIONS
  /////////////////////////

  async repay(pos: LeveragePosition, amountRepay: string) {
    await this.write("repay", [
      {
        loanToken: pos.collateralToken.loanToken.address,
        collateralToken: pos.collateralToken.address,
        oracle: "0xe8465B52E106d98157d82b46cA566CB9d09482A9",
        irm: "0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC",
        lltv: parseUnits(pos.collateralToken.liqLtv, 16),
      },
      parseUnits(amountRepay, pos.collateralToken.loanToken.decimals),
      BigInt(0),
      pos.userProxy,
      "0x",
    ]);
  }

  withdrawCollateralEncodedData(pos: LeveragePosition, amountWithdraw: string, ltv: BigNumber) {
    if (ltv.isGreaterThan(0.75)) {
      throw { shortMessage: "LTV exceeds 75%" };
    }

    return encodeFunctionData({
      abi: MORPHO_ABI,
      functionName: "withdrawCollateral",
      args: [
        {
          loanToken: pos.collateralToken.loanToken.address,
          collateralToken: pos.collateralToken.address,
          oracle: "0xe8465B52E106d98157d82b46cA566CB9d09482A9",
          irm: "0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC",
          lltv: parseUnits(pos.collateralToken.liqLtv, 16),
        },
        parseUnits(amountWithdraw, pos.collateralToken.decimals),
        pos.userProxy,
        pos.owner,
      ],
    });
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
