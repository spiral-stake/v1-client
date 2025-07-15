import { Token, CollateralToken } from "../types/index";
import { Base } from "./Base.ts";
import { abi as FLASH_LEVERAGE_ABI } from "../abi/FlashLeverageCore.sol/FlashLeverageCore.json";
import { formatUnits, parseUnits } from "../utils/formatUnits.ts";
import { readToken } from "../config/contractsData.ts";
import BigNumber from "bignumber.js";

export default class FlashLeverageCore extends Base {
  public usdc: Token = {
    address: "",
    name: "",
    symbol: "",
    decimals: 0,
    image: "",
    valueInUsd: BigNumber(0),
  };

  DEFAULT_DECIMALS = 18;

  constructor(flashLeverageAddress: string) {
    super(flashLeverageAddress, FLASH_LEVERAGE_ABI);
  }

  static async createInstance(chainId: number) {
    try {
      const [{ flashLeverageCoreAddress }, _usdc] = await Promise.all([
        import(`../addresses/${chainId}.json`),
        readToken(chainId, "USDC"),
      ]);

      const instance = new FlashLeverageCore(flashLeverageCoreAddress);
      instance.usdc = _usdc;

      return instance;
    } catch (e) {
      console.log(e);
    }
  }

  /////////////////////////
  // Read Functions

  async getTokenUsdValue(token: Token, amount: string) {
    const tokenUsdValue = await this.read("getTokenUsdValue", [
      token.address,
      parseUnits(amount, token.decimals),
    ]);

    return formatUnits(tokenUsdValue as bigint, this.DEFAULT_DECIMALS);
  }

  async getMaxLtv(collateralToken: CollateralToken, loanToken: Token) {
    const maxLtv = await this.read("getMaxLtv", [collateralToken.address, loanToken.address]);
    return formatUnits(maxLtv as bigint, this.DEFAULT_DECIMALS).multipliedBy(100); // in percentage
  }

  async getLoanAmount(collateralToken: CollateralToken, amount: string | bigint) {
    if (typeof amount === "string") {
      amount = parseUnits(amount, collateralToken.decimals);
    }

    const amountLoan = await this.read("calcLoanAmount", [
      collateralToken.address,
      this.usdc.address,
      amount,
    ]);

    return String(amountLoan);
  }

  async getRepayAmount(collateralToken: CollateralToken, sharesBorrowed: bigint) {
    const amountRepay = await this.read("getSharesToAsset", [
      collateralToken.address,
      this.usdc.address,
      sharesBorrowed,
    ]);

    return formatUnits(amountRepay as bigint, this.usdc.decimals);
  }

  // calcLoanAmount(collateralToken: CollateralToken, amountCollateral: string) {
  //   const amountCollateralInUsd = BigNumber(amountCollateral).multipliedBy(
  //     collateralToken.valueInUsd
  //   );

  //   const numerator = amountCollateralInUsd.multipliedBy(100);
  //   const denominator = BigNumber(100).minus(collateralToken.maxLtv);

  //   return parseUnits(
  //     String(numerator.dividedBy(denominator).minus(amountCollateralInUsd)),
  //     this.usdc.decimals
  //   );
  // }
}
