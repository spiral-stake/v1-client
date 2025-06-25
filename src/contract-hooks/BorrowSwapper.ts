import { Position, Token } from "../types/index";
import { Base } from "./Base.ts";
import { abi as BORROW_SWAPPER_ABI } from "../abi/BorrowSwapper.sol/BorrowSwapper.json";
import { formatUnits, parseUnits } from "../utils/formatUnits.ts";
import { readfrxUSD } from "../config/contractsData.ts";

export default class BorrowSwapper extends Base {
  public frxUSD: Token;

  constructor(borrowSwapperAddress: string) {
    super(borrowSwapperAddress, BORROW_SWAPPER_ABI);
  }

  static async createInstance(chainId: number) {
    const [{ borrowSwapperAddress }, frxUSD] = await Promise.all([
      import(`../addresses/${chainId}.json`),
      readfrxUSD(chainId),
    ]);

    const instance = new BorrowSwapper(borrowSwapperAddress);
    instance.frxUSD = frxUSD;
    return instance;
  }

  DEFAULT_DECIMALS = 18;

  /////////////////////////
  // Write Functions

  async openPosition(
    collateralToken: Token,
    swapToken: Token,
    amountCollateral: string,
    amountToMint: string
  ) {
    return this.write("openPosition", [
      collateralToken.address,
      swapToken.address,
      parseUnits(amountCollateral, collateralToken.decimals),
      parseUnits(amountToMint, this.DEFAULT_DECIMALS),
    ]);
  }
}
