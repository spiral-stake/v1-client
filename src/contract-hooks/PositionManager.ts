import { Position, Token } from "./../types/index";
import { Base } from "./Base";
import { abi as POSITION_MANAGER_ABI } from "../abi/PositionManager.sol/PositionManager.json";
import { formatUnits, parseUnits } from "../utils/formatUnits.ts";
import { readCollateralTokens, readCollateralToken, readStblUSD } from "../config/contractsData.ts";
import BigNumber from "bignumber.js";

export default class PositionManager extends Base {
  public chainId: number;
  public maxLtv: string;
  public liqLtv: string;
  public collateralTokens: Token[]; // Supported Collateral Tokens to borrow against
  public stblUSD: Token;
  public borrowApy: string;

  constructor(positionManagerAddress: string) {
    super(positionManagerAddress, POSITION_MANAGER_ABI);
  }

  static async createInstance(chainId: number) {
    const { positionManagerAddress } = await import(`../addresses/${chainId}.json`);

    const instance = new PositionManager(positionManagerAddress);

    const [_maxLtv, _liqLtv, _collateralTokens, stblUSD] = await Promise.all([
      instance.read("MAX_LTV"),
      instance.read("LIQ_LTV"),
      readCollateralTokens(chainId),
      readStblUSD(chainId),
    ]);

    instance.chainId = chainId;
    instance.maxLtv = formatUnits(_maxLtv as bigint, instance.DEFAULT_DECIMALS)
      .multipliedBy(100)
      .toFixed(2);
    instance.liqLtv = formatUnits(_liqLtv as bigint, instance.DEFAULT_DECIMALS)
      .multipliedBy(100)
      .toFixed(2);
    instance.collateralTokens = _collateralTokens;
    instance.borrowApy = "3.6";
    instance.stblUSD = stblUSD;
    return instance;
  }

  DEFAULT_DECIMALS = 18;

  /////////////////////////
  // Write Functions

  async openPosition(collateralToken: Token, amountCollateral: string, amountToMint: string) {
    return this.write("openPosition", [
      collateralToken.address,
      parseUnits(amountCollateral, collateralToken.decimals),
      parseUnits(amountToMint, this.DEFAULT_DECIMALS),
    ]);
  }

  async depositCollateralAndMintStblUSD(
    position: Position,
    amountCollateral: string,
    amountToMint: string
  ) {
    return this.write("depositCollateralAndMintStblUSD", [
      position.id,
      parseUnits(amountCollateral, position.collateralToken.decimals),
      parseUnits(amountToMint, this.DEFAULT_DECIMALS),
    ]);
  }

  async depositCollateral(position: Position, amountCollateral: string) {
    return this.write("depositCollateral", [
      position.id,
      parseUnits(amountCollateral, position.collateralToken.decimals),
    ]);
  }

  async mintStblUSD(position: Position, amountToMint: string) {
    return this.write("mintStblUSD", [
      position.id,
      parseUnits(amountToMint, this.DEFAULT_DECIMALS),
    ]);
  }

  async redeemCollateralAndBurnStblUSD(
    position: Position,
    amountCollateral: string,
    amountToBurn: string
  ) {
    return this.write("redeemCollateralAndBurnStblUSD", [
      position.id,
      parseUnits(amountCollateral, position.collateralToken.decimals),
      parseUnits(amountToBurn, this.DEFAULT_DECIMALS),
    ]);
  }

  async redeemCollateral(position: Position, amountCollateral: string) {
    return this.write("redeemCollateral", [
      position.id,
      parseUnits(amountCollateral, position.collateralToken.decimals),
    ]);
  }

  async burnStblUSD(position: Position, amountToBurn: string) {
    return this.write("redeemCollateralAndBurnStblUSD", [
      position.id,
      parseUnits(amountToBurn, this.DEFAULT_DECIMALS),
    ]);
  }

  async liquidate(position: Position) {
    return this.write("liquidate", [position.id]);
  }

  /////////////////////////
  // Read Functions

  async getUserPositions(user: string) {
    const positionIds = await this.read("getUserPositionIds", [user]);

    if (!Array.isArray(positionIds)) {
      throw new Error("Invalid positionInfo data received");
    }

    return Promise.all(positionIds.map((id: number) => this.getPosition(id)));
  }

  async getPosition(positionId: number): Promise<Position> {
    const [positionInfo, collateralValueInUsd] = await Promise.all([
      this.read("getPosition", [positionId]),
      this.read("getPositionCollateralValue", [positionId]),
    ]);

    const collateralToken = await readCollateralToken(this.chainId, positionInfo.collateralToken);

    const stblUSDMinted = formatUnits(positionInfo.stblUSDMinted as bigint, this.DEFAULT_DECIMALS);
    const collateralUsdValue = formatUnits(collateralValueInUsd as bigint, this.DEFAULT_DECIMALS);

    const ltv = stblUSDMinted.dividedBy(collateralUsdValue);

    return {
      id: positionId,
      owner: positionInfo.owner,
      collateralToken,
      collateralDeposited: formatUnits(
        positionInfo.collateralDeposited as bigint,
        collateralToken.decimals
      ),
      collateralValueInUsd: collateralUsdValue,
      stblUSDMinted,
      ltv,
      borrowApy: BigNumber(this.borrowApy), // Needs to change
    };
  }

  async getTokenUsdValue(token: Token, amount: string) {
    const tokenUsdValue = await this.read("getTokenUsdValue", [
      token.address,
      parseUnits(amount, token.decimals),
    ]);

    return formatUnits(tokenUsdValue as bigint, token.decimals);
  }

  // UNUSED FUNCTIONS

  async getMaxLtv() {
    const maxLtv = await this.read("MAX_LTV");
    return formatUnits(maxLtv as bigint, this.DEFAULT_DECIMALS);
  }

  async getLiqLtv() {
    const liqLtv = await this.read("LIQ_LTV");
    return formatUnits(liqLtv as bigint, this.DEFAULT_DECIMALS);
  }

  async getPositionCollateralValue(position: Position) {
    const userPositionCollateralValue = await this.read("getPositionCollateralValue", [
      position.id,
    ]);

    return formatUnits(userPositionCollateralValue as bigint, this.DEFAULT_DECIMALS); // Needs to change
  }

  async getPositionLTV(position: Position) {
    const userPositionLTV = await this.read("getPositionLTV", [position.id]);

    return formatUnits(userPositionLTV as bigint, this.DEFAULT_DECIMALS);
  }
}
