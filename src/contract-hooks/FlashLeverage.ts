import { Position, Token, LeveragePosition } from "./../types/index";
import { Base } from "./Base";
import { abi as FLASH_LEVERAGE_ABI } from "../abi/FlashLeverage.sol/FlashLeverage.json";
import { formatUnits, parseUnits } from "../utils/formatUnits.ts";
import { readCollateralTokens } from "../config/contractsData.ts";
import BigNumber from "bignumber.js";
import PositionManager from "./PositionManager.ts";

export default class FlashLeverage extends Base {
  public chainId: number;
  public maxLeverageLtv: string;
  public collateralTokens: Token[]; // Supported Collateral Tokens to borrow against

  constructor(flashLeverageAddress: string) {
    super(flashLeverageAddress, FLASH_LEVERAGE_ABI);
  }

  static async createInstance(chainId: number) {
    const { flashLeverageAddress } = await import(`../addresses/${chainId}.json`);

    const instance = new FlashLeverage(flashLeverageAddress);

    const [_maxLtv, _collateralTokens] = await Promise.all([
      instance.read("MAX_LEVERAGE_LTV"),
      readCollateralTokens(chainId),
    ]);

    instance.chainId = chainId;
    instance.maxLeverageLtv = formatUnits(_maxLtv as bigint, instance.DEFAULT_DECIMALS)
      .multipliedBy(100)
      .toFixed(2);
    instance.collateralTokens = _collateralTokens;

    return instance;
  }

  DEFAULT_DECIMALS = 18;

  /////////////////////////
  // Write Functions

  async leverage(
    userAddress: string,
    collateralToken: Token,
    userCollateralAmount: string,
    desiredLtv: string
  ) {
    await this.write("leverage", [
      userAddress,
      collateralToken.address,
      parseUnits(userCollateralAmount, collateralToken.decimals),
      parseUnits(BigNumber(desiredLtv).dividedBy(100).toFixed(2), this.DEFAULT_DECIMALS),
    ]);
  }

  async unleverage(leveragePositionId: number) {
    await this.write("unleverage", [leveragePositionId]);
  }

  /////////////////////////
  // Read Functions

  async getUserLeveragePositions(user: string, positionManager: PositionManager) {
    const userLeveragePositions = await this.read("getUserLeveragePositions", [user]);

    if (!Array.isArray(userLeveragePositions)) {
      throw new Error("Invalid positionInfo data received");
    }

    return Promise.all(
      userLeveragePositions.map(async (leveragePosition: any, index): Promise<LeveragePosition> => {
        const debtPosition = await positionManager.getPosition(leveragePosition.debtPositionId);

        const userCollateralDeposited = formatUnits(
          leveragePosition.userCollateralDeposited as bigint,
          debtPosition.collateralToken.decimals
        );

        return {
          owner: user,
          id: index,
          userCollateralDeposited,
          userCollateralDepositedValueInUsd: userCollateralDeposited.multipliedBy(
            debtPosition.collateralValueInUsd.dividedBy(debtPosition.collateralDeposited)
          ),
          debtPosition,
        };
      })
    );
  }
}
