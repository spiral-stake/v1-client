import { Token } from "./../types/index";
import { decodeEventLog } from "viem";
import {
  CollateralToken,
  ExternalSwapData,
  InternalSwapData,
  LeveragePosition,
} from "../types/index";
import { Base } from "./Base.ts";
import { abi as FLASH_LEVERAGE_ABI } from "../abi/FlashLeverage.sol/FlashLeverage.json";
import { formatUnits, parseUnits } from "../utils/formatUnits.ts";
import { readCollateralTokens, readToken } from "../config/contractsData.ts";
import BigNumber from "bignumber.js";
import FlashLeverageCore from "./FlashLeverageCore.ts";

export default class FlashLeverage extends Base {
  public chainId: number = 0;
  public collateralTokens: CollateralToken[] = []; // Supported Collateral Tokens to borrow against
  public borrowApy: string = "";
  public usdc: Token = {
    address: "",
    name: "",
    symbol: "",
    decimals: 0,
    image: "",
    valueInUsd: BigNumber(0),
  };

  flashLeverageCore: FlashLeverageCore;
  DEFAULT_DECIMALS = 18;

  constructor(flashLeverageAddress: string) {
    super(flashLeverageAddress, FLASH_LEVERAGE_ABI);
  }

  static async createInstance(chainId: number) {
    const flashLeverageCore = await FlashLeverageCore.createInstance(chainId);
    if (!flashLeverageCore) return;

    try {
      const [{ flashLeverageAddress }, _collateralTokens, _usdc] = await Promise.all([
        import(`../addresses/${chainId}.json`),
        readCollateralTokens(chainId),
        readToken(chainId, "USDC"),
      ]);

      const instance = new FlashLeverage(flashLeverageAddress);

      instance.flashLeverageCore = flashLeverageCore;
      instance.chainId = chainId;
      instance.borrowApy = "5.46";
      instance.usdc = _usdc;
      instance.collateralTokens = await Promise.all(
        _collateralTokens.map(
          async (collateralToken: CollateralToken): Promise<CollateralToken> => {
            const [valueInUsd, maxLtv] = await Promise.all([
              instance.flashLeverageCore.getTokenUsdValue(collateralToken, "1"),
              instance.flashLeverageCore.getMaxLtv(collateralToken, _usdc),
            ]);

            return {
              ...collateralToken,
              valueInUsd,
              maxLtv: maxLtv.toFixed(2),
            };
          }
        )
      );

      return instance;
    } catch (e) {
      console.log(e);
    }
  }

  /////////////////////////
  // Write Functions

  async swapAndLeverage(
    userAddress: string,
    fromToken: Token,
    amount: string,
    externalSwapData: ExternalSwapData,
    collateralToken: CollateralToken,
    loanToken: Token,
    internalSwapData: InternalSwapData
  ) {
    await this.write("swapAndLeverage", [
      userAddress,
      {
        tokenIn: fromToken.address,
        amountTokenIn: parseUnits(amount, fromToken.decimals),
        ...externalSwapData,
      },
      {
        collateralToken: collateralToken.address,
        loanToken: loanToken.address,
        amountCollateral: externalSwapData.minCollateralOut,
        ...internalSwapData,
      },
    ]);
  }

  async leverage(
    userAddress: string,
    collateralToken: Token,
    userCollateralAmount: string,
    internalSwapData: InternalSwapData
  ) {
    await this.write("leverage", [
      userAddress,
      {
        collateralToken: collateralToken.address,
        loanToken: this.usdc.address,
        amountCollateral: parseUnits(userCollateralAmount, collateralToken.decimals),
        ...internalSwapData,
      },
    ]);
  }

  async unleverage(
    leveragePositionId: number,
    pendleSwap: string,
    swapData: any,
    limitOrderData: any
  ) {
    const txReceipt = await this.simulate("unleverage", [
      leveragePositionId,
      pendleSwap,
      swapData,
      limitOrderData,
    ]);

    const log = txReceipt.logs.find(
      (log) => log.address.toLowerCase() === this.address.toLowerCase()
    );

    const { amountReturned } = decodeEventLog({
      abi: this.abi,
      eventName: "LeveragePositionClosed",
      topics: log.topics,
    }).args as { amountReturned: bigint };

    return formatUnits(amountReturned, this.usdc.decimals);
  }

  /////////////////////////
  // Read Functions

  async getUserLeveragePositions(user: string): Promise<LeveragePosition[]> {
    const _userLeveragePositions = (await this.read("getUserLeveragePositions", [user])) as Array<{
      collateralToken: string;
      loanToken: string;
      amountCollateral: bigint;
      amountLeveragedCollateral: bigint;
      sharesBorrowed: bigint;
      open: boolean;
    }>;

    console.log(_userLeveragePositions);

    if (!Array.isArray(_userLeveragePositions)) {
      throw new Error("Invalid positionInfo data received");
    }

    // Use Promise.all with map instead of forEach for async operations
    const positions = await Promise.all(
      _userLeveragePositions.map(async (pos, index) => {
        const collateralToken = this.collateralTokens.find(
          (token) => token.address.toLowerCase() === pos.collateralToken.toLowerCase()
        ) as CollateralToken;

        const amountLeveragedCollateral = formatUnits(
          pos.amountLeveragedCollateral,
          collateralToken.decimals
        );
        const amountLeveragedCollateralInUsd = amountLeveragedCollateral.multipliedBy(
          collateralToken.valueInUsd
        );
        const amountLoan = await this.flashLeverageCore.getRepayAmount(
          collateralToken,
          pos.sharesBorrowed
        );

        return {
          open: pos.open,
          owner: user,
          id: index,
          collateralToken,
          amountCollateral: formatUnits(pos.amountCollateral, collateralToken?.decimals),
          amountLeveragedCollateral,
          amountLoan,
          sharesBorrowed: pos.sharesBorrowed,
          ltv: amountLoan.multipliedBy(100).div(amountLeveragedCollateralInUsd).toFixed(2),
        };
      })
    );

    // Filter out null values and return the result
    return positions.filter((pos): pos is LeveragePosition => pos.open);
  }
}
