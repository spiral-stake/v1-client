import { Token } from "./../types/index";
import { decodeEventLog } from "viem";
import { CollateralToken, InternalSwapData, LeveragePosition } from "../types/index";
import { Base } from "./Base.ts";
import { abi as FLASH_LEVERAGE_CORE_ABI } from "../abi/FlashLeverageCore.sol/FlashLeverageCore.json";
import { abi as FLASH_LEVERAGE_ABI } from "../abi/FlashLeverage.sol/FlashLeverage.json";
import { formatUnits, parseUnits } from "../utils/formatUnits.ts";
import { readCollateralTokens, readToken } from "../config/contractsData.ts";
import BigNumber from "bignumber.js";
import FlashLeverageCore from "./FlashLeverageCore.ts";
import { getImpliedApy } from "../api-services/pendle.ts";
import { getBorrowApy } from "../api-services/morpho.ts";

export default class FlashLeverage extends Base {
  public chainId: number = 0;
  public collateralTokens: CollateralToken[] = []; // Supported Collateral Tokens to borrow against
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
    super(flashLeverageAddress, [...FLASH_LEVERAGE_ABI, ...FLASH_LEVERAGE_CORE_ABI]);
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
      instance.usdc = _usdc;
      instance.collateralTokens = await Promise.all(
        _collateralTokens.map(
          async (collateralToken: CollateralToken): Promise<CollateralToken> => {
            const [valueInUsd, safeLtv, maxLtv, liqLtv, impliedApy, borrowApy] = await Promise.all([
              instance.flashLeverageCore.getTokenUsdValue(collateralToken, "1"),
              instance.flashLeverageCore.getSafeLtv(collateralToken, collateralToken.loanToken),
              instance.flashLeverageCore.getMaxLtv(collateralToken, collateralToken.loanToken),
              instance.flashLeverageCore.getLiqLtv(collateralToken, collateralToken.loanToken),
              getImpliedApy(chainId, collateralToken),
              getBorrowApy(chainId, collateralToken),
            ]);

            return {
              ...collateralToken,
              valueInUsd,
              impliedApy,
              borrowApy,
              safeLtv: safeLtv.toFixed(2),
              maxLtv: maxLtv.toFixed(2),
              liqLtv: liqLtv.toFixed(2),
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
    externalSwapData: InternalSwapData,
    collateralToken: CollateralToken,

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
        loanToken: collateralToken.loanToken.address,
        amountCollateral: externalSwapData.minOut,
        ...internalSwapData,
      },
    ]);
  }

  async leverage(
    userAddress: string,
    collateralToken: CollateralToken,
    userCollateralAmount: string,
    internalSwapData: InternalSwapData
  ) {
    await this.write("leverage", [
      userAddress,
      {
        collateralToken: collateralToken.address,
        loanToken: collateralToken.loanToken.address,
        amountCollateral: parseUnits(userCollateralAmount, collateralToken.decimals),
        ...internalSwapData,
      },
    ]);
  }

  async unleverage(
    leveragePosition: LeveragePosition,
    pendleSwap: string,
    tokenRedeemSy: string,
    swapData: any,
    limitOrderData: any
  ) {
    const txReceipt = await this.write("unleverage", [
      leveragePosition.id,
      pendleSwap,
      tokenRedeemSy,
      swapData,
      limitOrderData,
    ]);

    const log = txReceipt.logs.find(
      (log) => log.address.toLowerCase() === this.address.toLowerCase()
    );

    if (!log) return;

    const { amountReturned } = decodeEventLog({
      abi: this.abi,
      eventName: "LeveragePositionClosed",
      topics: log.topics,
    }).args as { amountReturned: bigint };

    return formatUnits(amountReturned, leveragePosition.collateralToken.loanToken.decimals);
  }

  /////////////////////////
  // Read Functions

  async getUserLeveragePositions(user: string): Promise<LeveragePosition[]> {
    const _userLeveragePositions = (await this.read("getUserLeveragePositions", [user])) as Array<{
      open: boolean;
      collateralToken: string;
      loanToken: string;
      collateralTokenUsdValue: bigint;
      amountCollateral: bigint;
      amountLeveragedCollateral: bigint;
      sharesBorrowed: bigint;
    }>;

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
