import { BigNumber } from "bignumber.js";
import { LeveragePosition } from "../types/index";
import { calcLeverageApy } from "./index";

export const updatePositionsData = (
  allLeveragePositions: any[],
  address: string,
  leveragePositions: LeveragePosition[]
): LeveragePosition[] => {
  const addressPrefix = address.toLowerCase();

  // Build lookup tables for both implied APY and amount deposited
  const positionsLookup = Object.fromEntries(
    allLeveragePositions
      .filter(({ positionId }) => positionId.startsWith(addressPrefix))
      .map((pos) => [
        pos.positionId.slice(42),
        {
          impliedApy: pos.atImpliedApy,
          amountDepositedInUsd: pos.amountDepositedInUsd,
          amountReturnedInUsd: pos.amountReturnedInUsd,
        },
      ])
  );

  return leveragePositions.map((pos) => {
    const position = positionsLookup[pos.id];

    return {
      ...pos,

      collateralToken: {
        ...pos.collateralToken,
        impliedApy: position?.impliedApy ?? pos.collateralToken.impliedApy,
      },

      amountDepositedInUsd: BigNumber(
        position?.amountDepositedInUsd ??
          pos.amountCollateral.multipliedBy(pos.collateralToken.valueInUsd)
      ),

      amountReturnedInUsd: position?.amountReturnedInUsd
        ? BigNumber(position.amountReturnedInUsd)
        : undefined,

      yieldGenerated: pos.positionValueInUsd.minus(
        BigNumber(
          position?.amountDepositedInUsd ??
            pos.amountCollateral.multipliedBy(pos.collateralToken.valueInUsd)
        )
      ),

      leverageApy: calcLeverageApy(
        position?.impliedApy ?? pos.collateralToken.impliedApy,
        pos.collateralToken.borrowApy,
        pos.ltv
      ),
    };
  });
};
