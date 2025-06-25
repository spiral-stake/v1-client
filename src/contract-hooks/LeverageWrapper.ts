import { Position, Token } from "../types/index";
import { Base } from "./Base.ts";
import { abi as LEVERAGE_VIA_PYUSD_ABI } from "../abi/LeverageWrapper.sol/LeverageWrapper.json";
import { formatUnits, parseUnits } from "../utils/formatUnits.ts";
import { readfrxUSD } from "../config/contractsData.ts";
import BigNumber from "bignumber.js";

export default class LeverageWrapper extends Base {
  public frxUSD: Token;

  constructor(leverageWrapperAddress: string) {
    super(leverageWrapperAddress, LEVERAGE_VIA_PYUSD_ABI);
  }

  static async createInstance(chainId: number) {
    const [{ leverageWrapperAddress }, frxUSD] = await Promise.all([
      import(`../addresses/${chainId}.json`),
      readfrxUSD(chainId),
    ]);
    const instance = new LeverageWrapper(leverageWrapperAddress);

    instance.frxUSD = frxUSD;
    return instance;
  }

  DEFAULT_DECIMALS = 18;

  /////////////////////////
  // Write Functions

  async leverage(
    fromToken: Token,
    amountToken: string,
    collateralToken: Token,
    desiredLtv: string
  ) {
    await this.write("leverage", [
      fromToken.address,
      parseUnits(amountToken, fromToken.decimals),
      collateralToken.address,
      parseUnits(BigNumber(desiredLtv).dividedBy(100).toFixed(2), this.DEFAULT_DECIMALS),
    ]);
  }
}
