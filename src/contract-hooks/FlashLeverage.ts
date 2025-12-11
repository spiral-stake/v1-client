import type {
  Token,
  CollateralToken,
  LeveragePosition,
  LeverageSwapData,
  DeleverageSwapData,
} from "../types/index.ts";
import { Base } from "./Base.ts";
import { abi as FLASH_LEVERAGE_ABI } from "../abi/FlashLeverage.sol/FlashLeverage.json";
import { formatUnits, parseUnits } from "../utils/formatUnits.ts";
import { readCollateralTokens, readToken } from "../api-services/contractsData.ts";
import BigNumber from "bignumber.js";
import Morpho from "./Morpho.ts";
import { calcLeverage, calcLeverageApy } from "../utils/index.ts";
import { getMarketData } from "../api-services/morpho.ts";
import { getTokenPrice } from "../api-services/tokenPrice.ts";
import { getTokenApy } from "../api-services/apy.ts";

export default class FlashLeverage extends Base {
  public chainId: number = 0;
  public collateralTokens: CollateralToken[] = []; // Supported Collateral Tokens to borrow against

  morpho: Morpho;
  STANDARD_DECIMALS = 18;
  PERCENT_DECIMALS = 16;

  // Swap From Tokens
  public usdc: Token = {
    address: "",
    name: "",
    symbol: "",
    decimals: 0,
    valueInUsd: BigNumber(0),
  };

  public usdt: Token = {
    address: "",
    name: "",
    symbol: "",
    decimals: 0,
    valueInUsd: BigNumber(0),
  };

  constructor(flashLeverageAddress: string) {
    super(flashLeverageAddress, FLASH_LEVERAGE_ABI);
    this.morpho = new Morpho();
  }

  static async createInstance(chainId: number) {
    try {
      const [{ flashLeverageAddress }, _collateralTokens] = await Promise.all([
        import(`../addresses/${chainId}.json`),
        readCollateralTokens(chainId),
        // readToken(chainId, "USDC"),
        // readToken(chainId, "USDT"),
      ]);

      const instance = new FlashLeverage(flashLeverageAddress);
      instance.chainId = chainId;
      instance.collateralTokens = await Promise.all(
        _collateralTokens.map(
          async (collateralToken: CollateralToken): Promise<CollateralToken> => {
            const [
              collateralTokenValueInLoanToken,
              maxLtv,
              liqLtv,
              marketData,
              loanTokenPrice,
              tokenApy,
            ] = await Promise.all([
              instance.getCollateralValueInLoanToken(collateralToken, "1"),
              instance.getMaxLtv(collateralToken, collateralToken.loanToken),
              instance.getLiqLtv(collateralToken, collateralToken.loanToken),
              getMarketData(chainId, collateralToken),
              collateralToken.loanToken.coingeckoId
                ? getTokenPrice(collateralToken.loanToken.coingeckoId)
                : BigNumber(0),
              getTokenApy(chainId, collateralToken),
            ]);

            const safeLtv = maxLtv.toFixed(2);

            return {
              ...collateralToken,
              loanToken: {
                ...collateralToken.loanToken,
              },
              valueInLoanToken: collateralTokenValueInLoanToken,
              apy: tokenApy,
              valueInUsd: BigNumber(collateralTokenValueInLoanToken).multipliedBy(
                collateralToken.loanToken.valueInUsd
              ),
              borrowApy: marketData.borrowApy,
              liquidityAssets: BigNumber(marketData.liquidityAssets),
              safeLtv: safeLtv,
              maxLtv: maxLtv.toFixed(2),
              liqLtv: liqLtv.toFixed(2),
              defaultLeverage: calcLeverage(safeLtv),
              defaultLeverageApy: calcLeverageApy(tokenApy, marketData.borrowApy, safeLtv),
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

  async leverage(
    userAddress: string,
    desiredLtv: string,
    collateralToken: CollateralToken,
    userCollateralAmount: string,
    leverageSwapData: LeverageSwapData
  ) {
    const txReceipt = await this.write("leverage", [
      userAddress,
      {
        desiredLtv: parseUnits(desiredLtv, this.PERCENT_DECIMALS),
        collateralToken: collateralToken.address,
        loanToken: collateralToken.loanToken.address,
        amountCollateral: parseUnits(userCollateralAmount, collateralToken.decimals),
        ...leverageSwapData,
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
      amountDepositedInLoanToken: formatUnits(
        amountDepositedInLoanToken,
        collateralToken.loanToken.decimals
      ),
    };
  }

  async deleverage(leveragePosition: LeveragePosition, deleverageSwapData: DeleverageSwapData) {
    const txReceipt = await this.write("deleverage", [
      leveragePosition.id,
      { ...deleverageSwapData },
    ]);

    const { amountReturnedInLoanToken } = this.decodeEvent(txReceipt, "LeveragePositionClosed") as {
      amountReturnedInLoanToken: bigint;
    };

    return formatUnits(
      amountReturnedInLoanToken,
      leveragePosition.collateralToken.loanToken.decimals
    );
  }

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
      amountDepositedInLoanToken: formatUnits(
        amountDepositedInLoanToken,
        collateralToken.loanToken.decimals
      ),
    };
  }

  /////////////////////////
  // Read Functions

  async getUserLeveragePositions(user: string): Promise<LeveragePosition[]> {
    const _userLeveragePositions = (await this.read("getUserLeveragePositions", [user])) as Array<{
      open: boolean;
      collateralToken: string;
      loanToken: string;
      amountCollateral: bigint;
      amountLeveragedCollateral: bigint;
      sharesBorrowed: bigint;
      userProxy: string;
      amountCollateralInLoanToken: bigint;
    }>;

    // Use Promise.all with map instead of forEach for async operations
    const positions = await Promise.all(
      _userLeveragePositions.map(async (pos, index) => {
        const collateralToken = this.collateralTokens.find(
          (token) => token.address.toLowerCase() === pos.collateralToken.toLowerCase()
        ) as CollateralToken;

        const amountCollateral = formatUnits(pos.amountCollateral, collateralToken.decimals);
        const amountCollateralInLoanToken = amountCollateral.multipliedBy(
          collateralToken.valueInLoanToken
        );

        const amountLeveragedCollateral = formatUnits(
          pos.amountLeveragedCollateral,
          collateralToken.decimals
        );
        const amountLeveragedCollateralInLoanToken = amountLeveragedCollateral.multipliedBy(
          collateralToken.valueInLoanToken
        );

        const [amountLoan, { collateral: morphoCollateral }] = await Promise.all([
          this.calcDeleverageFlashLoan(collateralToken, pos.sharesBorrowed),
          this.morpho.position(collateralToken.morphoMarketId, pos.userProxy),
        ]);

        const ltv = amountLoan
          .multipliedBy(100)
          .div(amountLeveragedCollateralInLoanToken)
          .toFixed(2);

        return {
          open: pos.open,
          liquidated: pos.open && morphoCollateral < pos.amountLeveragedCollateral,
          owner: user,
          id: index,
          userProxy: pos.userProxy,
          collateralToken,
          amountCollateral,
          amountLeveragedCollateral,
          amountLoan,
          sharesBorrowed: pos.sharesBorrowed,
          ltv,
          amountCollateralInLoanToken: formatUnits(
            pos.amountCollateralInLoanToken,
            collateralToken.decimals
          ),
          amountDepositedInLoanToken: amountCollateral.multipliedBy(
            collateralToken.valueInLoanToken
          ),
          leverage: calcLeverage(ltv),
          positionValueInLoanToken: amountLeveragedCollateral
            .multipliedBy(collateralToken.valueInLoanToken)
            .minus(amountLoan),

          // will be added from the server
          leverageApy: calcLeverageApy(collateralToken.apy, collateralToken.borrowApy, ltv),
          amountReturnedInLoanToken: BigNumber(0),
          yieldGenerated: amountLeveragedCollateralInLoanToken
            .minus(amountLoan)
            .minus(amountCollateralInLoanToken),
          openedOn: 0,
          heldFor: 0,
        };
      })
    );

    // Filter out null values and return the result
    return positions;
  }

  async getCollateralValueInLoanToken(token: CollateralToken, amount: string) {
    const tokenUsdValue = await this.read("getCollateralValueInLoanToken", [
      token.address,
      token.loanToken.address,
      parseUnits(amount, this.STANDARD_DECIMALS),
    ]);

    return formatUnits(tokenUsdValue as bigint, this.STANDARD_DECIMALS);
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

  async calcDeleverageFlashLoan(collateralToken: CollateralToken, sharesBorrowed: bigint) {
    const amountRepay = await this.read("calcDeleverageFlashLoan", [
      collateralToken.address,
      collateralToken.loanToken.address,
      sharesBorrowed,
    ]);

    return formatUnits(amountRepay as bigint, collateralToken.loanToken.decimals);
  }
}
