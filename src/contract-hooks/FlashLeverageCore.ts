import type { Token, CollateralToken } from "../types/index.ts";
import { Base } from "./Base.ts";
import { abi as FLASH_LEVERAGE_CORE_ABI } from "../abi/FlashLeverageCore.sol/FlashLeverageCore.json";
import { formatUnits, parseUnits } from "../utils/formatUnits.ts";
import { readToken } from "../api-services/contractsData.ts";
import BigNumber from "bignumber.js";

export default class FlashLeverageCore extends Base {
  public usdc: Token = {
    address: "",
    name: "",
    symbol: "",
    decimals: 0,
    valueInUsd: BigNumber(0),
  };

  STANDARD_DECIMALS = 18;
  PERCENT_DECIMALS = 16;

  constructor(flashLeverageAddress: string) {
    super(flashLeverageAddress, FLASH_LEVERAGE_CORE_ABI);
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

  async getTokenUsdValue(token: CollateralToken, amount: string) {
    const tokenUsdValue = await this.read("getCollateralValueInLoanToken", [
      token.address,
      token.loanToken.address,
      parseUnits(amount, this.STANDARD_DECIMALS),
    ]);

    return formatUnits(tokenUsdValue as bigint, this.STANDARD_DECIMALS);
  }

  async getUserCoreLeveragePosition(
    user: string,
    collateralToken: CollateralToken,
    loanToken: Token,
    desiredLtv: bigint
  ) {
    return this.read("getUserCoreLeveragePosition", [
      user,
      desiredLtv,
      collateralToken.address,
      loanToken.address,
    ]);
  }

  async getOrCreateUserProxy(user: string, desiredLtv: bigint) {
    return this.read("getOrCreateUserProxy", [user, desiredLtv]);
  }

  async getMaxLtv(collateralToken: CollateralToken, loanToken: Token) {
    const maxLtv = await this.read("getMaxLtv", [collateralToken.address, loanToken.address]);
    return formatUnits(maxLtv as bigint, this.STANDARD_DECIMALS).multipliedBy(100); // in percentage
  }

  async getLiqLtv(collateralToken: CollateralToken, loanToken: Token) {
    const maxLtv = await this.read("getLiqLtv", [collateralToken.address, loanToken.address]);
    return formatUnits(maxLtv as bigint, this.STANDARD_DECIMALS).multipliedBy(100); // in percentage
  }

  async calcLeverageFlashLoan(
    desiredLtv: string,
    collateralToken: CollateralToken,
    amount: string | bigint | BigInt
  ) {
    if (typeof amount === "string") {
      amount = parseUnits(amount, collateralToken.decimals);
    }

    const amountLoan = await this.read("calcLeverageFlashLoan", [
      parseUnits(desiredLtv, this.PERCENT_DECIMALS),
      collateralToken.address,
      collateralToken.loanToken.address,
      amount,
    ]);

    return String(amountLoan);
  }

  async calcUnleverageFlashLoan(collateralToken: CollateralToken, sharesBorrowed: bigint) {
    const amountRepay = await this.read("calcUnleverageFlashLoan", [
      collateralToken.address,
      collateralToken.loanToken.address,
      sharesBorrowed,
    ]);

    return formatUnits(amountRepay as bigint, collateralToken.loanToken.decimals);
  }
}
