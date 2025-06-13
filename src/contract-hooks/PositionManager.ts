import { Position, Token } from "./../types/index";
import { Base } from "./Base";
import { abi as POSITION_MANAGER_ABI } from "../abi/PositionManager.sol/PositionManager.json";
import { formatUnits, parseUnits } from "../utils/formatUnits.ts";

export default class PositionManager extends Base {
  constructor(positionManagerAddress: string) {
    super(positionManagerAddress, POSITION_MANAGER_ABI);
  }

  static async createInstance(chainId: number) {
    const { positionManagerAddress } = await import(`../addresses/${chainId}.json`);
    return new PositionManager(positionManagerAddress);
  }

  DEFAULT_DECIMALS = 18;

  /////////////////////////
  // Write Functions

  async depositCollateralAndMintSPIUSD(
    collateralToken: Token,
    amountCollateral: string,
    amountToMint: string
  ) {
    return this.write("depositCollateralAndMintSPIUSD", [
      collateralToken.address,
      parseUnits(amountCollateral),
      parseUnits(amountToMint, this.DEFAULT_DECIMALS),
    ]);
  }

  async depositCollateral(collateralToken: Token, amountCollateral: string) {
    return this.write("depositCollateral", [collateralToken.address, parseUnits(amountCollateral)]);
  }

  async mintSPIUSD(collateralToken: Token, amountToMint: string) {
    return this.write("mintSPIUSD", [
      collateralToken.address,
      parseUnits(amountToMint, this.DEFAULT_DECIMALS),
    ]);
  }

  async redeemCollateralAndBurnSPIUSD(
    collateralToken: Token,
    amountCollateral: string,
    amountToBurn: string
  ) {
    return this.write("redeemCollateralAndBurnSPIUSD", [
      collateralToken.address,
      parseUnits(amountCollateral),
      parseUnits(amountToBurn, this.DEFAULT_DECIMALS),
    ]);
  }

  async redeemCollateral(collateralToken: Token, amountCollateral: string) {
    return this.write("redeemCollateral", [collateralToken.address, parseUnits(amountCollateral)]);
  }

  async burnSPIUSD(collateralToken: Token, amountToBurn: string) {
    return this.write("redeemCollateralAndBurnSPIUSD", [
      collateralToken.address,
      parseUnits(amountToBurn, this.DEFAULT_DECIMALS),
    ]);
  }

  async liquidate(userAddress: string, collateralToken: Token) {
    return this.write("liquidate", [userAddress, collateralToken.address]);
  }

  /////////////////////////
  // Read Functions

  async getMaxLtv() {
    const maxLtv = await this.read("MAX_LTV");
    return formatUnits(maxLtv as bigint, this.DEFAULT_DECIMALS);
  }

  async getLiqLtv() {
    const liqLtv = await this.read("LIQ_LTV");
    return formatUnits(liqLtv as bigint, this.DEFAULT_DECIMALS);
  }

  async getUserPosition(userAddress: string, collateralToken: Token): Promise<Position> {
    const [positionInfo, collateralValueInUsd] = await Promise.all([
      this.read("getUserPosition", [userAddress, collateralToken.address]),
      this.read("getUserPositionCollateralValue", [userAddress, collateralToken.address]),
    ]);

    if (!positionInfo || !Array.isArray(positionInfo) || positionInfo.length < 2) {
      throw new Error("Invalid positionInfo data received");
    }

    const collateralDeposited = formatUnits(positionInfo[0] as bigint, collateralToken.decimals);
    const spiUsdMinted = formatUnits(positionInfo[1] as bigint, this.DEFAULT_DECIMALS);
    const collateralUsdValue = formatUnits(
      collateralValueInUsd as bigint,
      collateralToken.decimals
    );

    const ltv = spiUsdMinted.dividedBy(collateralUsdValue);

    return {
      collateralToken,
      collateralDeposited,
      collateralValueInUsd: collateralUsdValue,
      spiUsdMinted,
      ltv,
    };
  }

  async getTokenUsdValue(token: Token, amount: string) {
    const tokenUsdValue = await this.read("getTokenUsdValue", [
      token.address,
      parseUnits(amount, token.decimals),
    ]);

    formatUnits(tokenUsdValue as bigint, token.decimals);
  }

  // UNUSED FUNCTIONS

  async getUserPositionCollateralValue(userAddress: string, collateralToken: Token) {
    const userPositionCollateralValue = await this.read("getUserPositionCollateralValue", [
      userAddress,
      collateralToken.address,
    ]);

    return formatUnits(userPositionCollateralValue as bigint, collateralToken.decimals);
  }

  async getUserPositionLTV(userAddress: string, collateralToken: Token) {
    const userPositionLTV = await this.read("getUserPositionLTV", [
      userAddress,
      collateralToken.address,
    ]);

    return formatUnits(userPositionLTV as bigint, this.DEFAULT_DECIMALS);
  }
}
