import { Token, CollateralToken, LeveragePosition, InternalSwapData } from "./../types/index";
import { Base } from "./Base";
import { abi as FLASH_LEVERAGE_ABI } from "../abi/FlashLeverage.sol/FlashLeverage.json";
import { formatUnits, parseUnits } from "../utils/formatUnits.ts";
import { readCollateralTokens, readToken } from "../config/contractsData.ts";
import BigNumber from "bignumber.js";
import { decodeEventLog } from "viem";

export default class FlashLeverage extends Base {
  public chainId: number;
  public collateralTokens: CollateralToken[]; // Supported Collateral Tokens to borrow against
  public borrowApy: string;
  public usdc: Token;

  constructor(flashLeverageAddress: string) {
    super(flashLeverageAddress, FLASH_LEVERAGE_ABI);
  }

  static async createInstance(chainId: number) {
    try {
      const { flashLeverageAddress } = await import(`../addresses/${chainId}.json`);

      const instance = new FlashLeverage(flashLeverageAddress);

      let [_collateralTokens, _usdc] = await Promise.all([
        readCollateralTokens(chainId),
        readToken(chainId, "USDC"),
      ]);

      _collateralTokens = await Promise.all(
        _collateralTokens.map(
          async (collateralToken: CollateralToken): Promise<CollateralToken> => {
            const [valueInUsd, maxLtv] = await Promise.all([
              instance.getTokenUsdValue(collateralToken, "1"),
              instance.getMaxLtv(collateralToken, _usdc),
            ]);

            return {
              ...collateralToken,
              valueInUsd,
              maxLtv: maxLtv.toFixed(2),
            };
          }
        )
      );

      instance.chainId = chainId;
      instance.borrowApy = "4.66";
      instance.collateralTokens = _collateralTokens;
      instance.usdc = _usdc;

      return instance;
    } catch (e) {
      console.log(e);
    }
  }

  DEFAULT_DECIMALS = 18;

  /////////////////////////
  // Write Functions

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
        amountUserCollateral: parseUnits(userCollateralAmount, collateralToken.decimals),
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
    const txReceipt = await this.write("unleverage", [
      leveragePositionId,
      pendleSwap,
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

    return formatUnits(amountReturned, this.usdc.decimals);
  }

  /////////////////////////
  // Read Functions

  async getUserLeveragePositions(user: string): Promise<LeveragePosition[]> {
    const _userLeveragePositions = (await this.read("getUserLeveragePositions", [user])) as Array<{
      collateralToken: string;
      loanToken: string;
      amountUserCollateral: bigint;
      amountTotalCollateral: bigint;
      sharesBorrowed: bigint;
      open: boolean;
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

        const amountTotalCollateral = formatUnits(
          pos.amountTotalCollateral,
          collateralToken.decimals
        );
        const amountTotalCollateralInUsd = amountTotalCollateral.multipliedBy(
          collateralToken.valueInUsd
        );
        const amountLoan = await this.getRepayAmount(collateralToken, pos.sharesBorrowed);

        return {
          open: pos.open,
          owner: user,
          id: index,
          collateralToken,
          amountUserCollateral: formatUnits(pos.amountUserCollateral, collateralToken?.decimals),
          amountTotalCollateral,
          amountLoan,
          sharesBorrowed: pos.sharesBorrowed,
          ltv: amountLoan.multipliedBy(100).div(amountTotalCollateralInUsd).toFixed(2),
        };
      })
    );

    // Filter out null values and return the result
    return positions.filter((pos): pos is LeveragePosition => pos.open);
  }

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
    const amountRepay = await this.read("getRepayAmount", [
      collateralToken.address,
      this.usdc.address,
      sharesBorrowed,
    ]);

    return formatUnits(amountRepay as bigint, this.usdc.decimals);
  }

  calcLoanAmount(collateralToken: CollateralToken, amountCollateral: string) {
    const amountCollateralInUsd = BigNumber(amountCollateral).multipliedBy(
      collateralToken.valueInUsd
    );

    const numerator = amountCollateralInUsd.multipliedBy(100);
    const denominator = BigNumber(100).minus(collateralToken.maxLtv);

    return parseUnits(
      String(numerator.dividedBy(denominator).minus(amountCollateralInUsd)),
      this.usdc.decimals
    );
  }
}
