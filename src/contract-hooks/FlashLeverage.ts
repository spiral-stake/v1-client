import { Token } from "./../types/index";
import { CollateralToken, InternalSwapData, LeveragePosition } from "../types/index";
import { Base } from "./Base.ts";
import { abi as FLASH_LEVERAGE_CORE_ABI } from "../abi/FlashLeverageCore.sol/FlashLeverageCore.json";
import { abi as FLASH_LEVERAGE_ABI } from "../abi/FlashLeverage.sol/FlashLeverage.json";
import { formatUnits, parseUnits } from "../utils/formatUnits.ts";
import { readCollateralTokens, readToken } from "../api-services/contractsData.ts";
import BigNumber from "bignumber.js";
import FlashLeverageCore from "./FlashLeverageCore.ts";
import { getImpliedApy } from "../api-services/pendle.ts";
import { getMarketData } from "../api-services/morpho.ts";
import { calcLeverage, calcLeverageApy } from "../utils/index.ts";

export default class FlashLeverage extends Base {
  public chainId: number = 0;
  public collateralTokens: CollateralToken[] = []; // Supported Collateral Tokens to borrow against
  public usdc: Token = {
    address: "",
    name: "",
    symbol: "",
    decimals: 0,
    valueInUsd: BigNumber(0),
  };

  flashLeverageCore: FlashLeverageCore;
  STANDARD_DECIMALS = 18;
  PERCENT_DECIMALS = 16;

  constructor(flashLeverageAddress: string) {
    super(flashLeverageAddress, [...FLASH_LEVERAGE_ABI, ...FLASH_LEVERAGE_CORE_ABI]);
    this.flashLeverageCore = new FlashLeverageCore(""); // To avoid warning
  }

  static async createInstance(chainId: number, legacy?: boolean) {
    const flashLeverageCore = await FlashLeverageCore.createInstance(chainId, legacy);
    if (!flashLeverageCore) return;

    try {
      const [{ flashLeverageAddress }, _collateralTokens, _usdc] = await Promise.all([
        !legacy
          ? import(`../addresses/${chainId}.json`)
          : import(`../legacy-addresses/${chainId}.json`),
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
            const [valueInUsd, maxLtv, liqLtv, impliedApy, marketData] = await Promise.all([
              instance.flashLeverageCore.getTokenUsdValue(collateralToken, "1"),
              instance.flashLeverageCore.getMaxLtv(collateralToken, collateralToken.loanToken),
              instance.flashLeverageCore.getLiqLtv(collateralToken, collateralToken.loanToken),
              getImpliedApy(chainId, collateralToken),
              getMarketData(chainId, collateralToken),
            ]);

            return {
              ...collateralToken,
              valueInUsd,
              impliedApy,
              borrowApy: marketData.borrowApy,
              liquidityAssetsUsd: marketData.liquidityAssetsUsd,
              safeLtv: maxLtv.minus(1).toFixed(2),
              maxLtv: maxLtv.toFixed(2),
              liqLtv: liqLtv.toFixed(2),
              defaultLeverage: calcLeverage(collateralToken.safeLtv),
              defaultLeverageApy: calcLeverageApy(
                impliedApy,
                marketData.borrowApy,
                maxLtv.minus(1).toFixed(2)
              ),
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
    desiredLtv: string,
    fromToken: Token,
    amount: string,
    externalSwapData: InternalSwapData,
    collateralToken: CollateralToken,
    internalSwapData: InternalSwapData
  ) {
    const txReceipt = await this.write("swapAndLeverage", [
      userAddress,
      {
        tokenIn: fromToken.address,
        amountTokenIn: parseUnits(amount, fromToken.decimals),
        ...externalSwapData,
      },
      {
        desiredLtv: parseUnits(desiredLtv, this.PERCENT_DECIMALS),
        collateralToken: collateralToken.address,
        loanToken: collateralToken.loanToken.address,
        amountCollateral: externalSwapData.minPtOut,
        ...internalSwapData,
      },
    ]);

    const { positionId, amountDepositedInLoanToken } = this.decodeEvent(
      txReceipt,
      "LeveragePositionOpened"
    ) as {
      positionId: bigint;
      amountDepositedInLoanToken: bigint;
    };

    return {
      positionId: Number(positionId),
      amountDepositedInUsd: formatUnits(
        amountDepositedInLoanToken,
        collateralToken.loanToken.decimals
      ),
    };
  }

  async leverage(
    userAddress: string,
    desiredLtv: string,
    collateralToken: CollateralToken,
    userCollateralAmount: string,
    internalSwapData: InternalSwapData
  ) {
    const txReceipt = await this.write("leverage", [
      userAddress,
      {
        desiredLtv: parseUnits(desiredLtv, this.PERCENT_DECIMALS),
        collateralToken: collateralToken.address,
        loanToken: collateralToken.loanToken.address,
        amountCollateral: parseUnits(userCollateralAmount, collateralToken.decimals),
        ...internalSwapData,
      },
    ]);

    const { positionId, amountDepositedInLoanToken } = this.decodeEvent(
      txReceipt,
      "LeveragePositionOpened"
    ) as {
      positionId: bigint;
      amountDepositedInLoanToken: bigint;
    };

    return {
      positionId: Number(positionId),
      amountDepositedInUsd: formatUnits(
        amountDepositedInLoanToken,
        collateralToken.loanToken.decimals
      ),
    };
  }

  async unleverage(
    userAddress: string,
    leveragePosition: LeveragePosition,
    pendleSwap: string,
    tokenRedeemSy: string,
    minTokenOut: bigint,
    swapData: any,
    limitOrderData: any
  ) {
    const txReceipt = await this.write("unleverage", [
      userAddress,
      leveragePosition.id,
      pendleSwap,
      tokenRedeemSy,
      minTokenOut,
      swapData,
      limitOrderData,
    ]);

    const { amountReturnedInLoanToken } = this.decodeEvent(txReceipt, "LeveragePositionClosed") as {
      amountReturnedInLoanToken: bigint;
    };

    return formatUnits(
      amountReturnedInLoanToken,
      leveragePosition.collateralToken.loanToken.decimals
    );
  }

  /////////////////////////
  // Read Functions

  async getUserLeveragePositions(user: string): Promise<LeveragePosition[]> {
    const _userLeveragePositions = (await this.read("getUserLeveragePositions", [user])) as Array<{
      open: boolean;
      collateralToken: string;
      loanToken: string;
      desiredLtv: bigint;
      collateralTokenUsdValue: bigint;
      amountCollateral: bigint;
      amountLeveragedCollateral: bigint;
      sharesBorrowed: bigint;
      positionValueInLoanToken: bigint;
      amountCollateralInLoanToken: bigint;
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

        const coreLeveragePosition = (await this.flashLeverageCore.getUserCoreLeveragePosition(
          user,
          collateralToken,
          collateralToken.loanToken,
          pos.desiredLtv
        )) as { amountCollateral: bigint; sharesBorrowed: bigint };

        const amountLeveragedCollateral = formatUnits(
          coreLeveragePosition.amountCollateral,
          collateralToken.decimals
        );
        const amountLeveragedCollateralInUsd = amountLeveragedCollateral.multipliedBy(
          collateralToken.valueInUsd
        );

        const [amountLoan] = await Promise.all([
          this.flashLeverageCore.calcUnleverageFlashLoan(
            collateralToken,
            coreLeveragePosition.sharesBorrowed
          ),
        ]);

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
          amountCollateralInLoanToken: formatUnits(
            pos.amountCollateralInLoanToken,
            collateralToken.decimals
          ),
        };
      })
    );

    // Filter out null values and return the result
    return positions.filter((pos): pos is LeveragePosition => pos.open);
  }

  async getPositionYieldInLoanToken(user: string, positionId: number) {
    const amountYield = await this.read("getPositionYieldInLoanToken", [user, positionId]);
    return formatUnits(amountYield as bigint, this.STANDARD_DECIMALS);
  }
}
