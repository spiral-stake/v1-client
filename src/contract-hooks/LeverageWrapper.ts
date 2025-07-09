import { CollateralToken, ExternalSwapData, InternalSwapData } from "./../types/index";
import { Token } from "../types/index";
import { Base } from "./Base.ts";
import { abi as LEVERAGE_WRAPPER_ABI } from "../abi/FlashLeverageWrapper.sol/FlashLeverageWrapper.json";
import { parseUnits } from "../utils/formatUnits.ts";
export default class LeverageWrapper extends Base {
  constructor(leverageWrapperAddress: string) {
    super(leverageWrapperAddress, LEVERAGE_WRAPPER_ABI);
  }

  static async createInstance(chainId: number) {
    try {
      const [{ leverageWrapperAddress }] = await Promise.all([
        import(`../addresses/${chainId}.json`),
      ]);
      const instance = new LeverageWrapper(leverageWrapperAddress);
      return instance;
    } catch (e) {}
  }

  DEFAULT_DECIMALS = 18;

  /////////////////////////
  // Write Functions

  async leverage(
    fromToken: Token,
    amount: string,
    externalSwapData: ExternalSwapData,
    collateralToken: CollateralToken,
    loanToken: Token,
    internalSwapData: InternalSwapData
  ) {
    console.log(
      {
        tokenIn: fromToken.address,
        amountTokenIn: parseUnits(amount, fromToken.decimals),
        ...externalSwapData, // spread must be outside any key-value pair
      },
      {
        collateralToken: collateralToken.address,
        loanToken: loanToken.address,
        amountUserCollateral: externalSwapData.minCollateralOut,
        ...internalSwapData,
      }
    );

    await this.write("leverage", [
      {
        tokenIn: fromToken.address,
        amountTokenIn: parseUnits(amount, fromToken.decimals),
        ...externalSwapData,
      },
      {
        collateralToken: collateralToken.address,
        loanToken: loanToken.address,
        amountUserCollateral: externalSwapData.minCollateralOut,
        ...internalSwapData,
      },
    ]);
  }
}
