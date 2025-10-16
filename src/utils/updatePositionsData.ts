import { BigNumber } from "bignumber.js";
import { LeveragePosition } from "../types/index";

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
        },
      ])
  );

  return leveragePositions.map((pos) => {
    const matched = positionsLookup[pos.id];

    return {
      ...pos,
      collateralToken: {
        ...pos.collateralToken,
        impliedApy: matched?.impliedApy ?? pos.collateralToken.impliedApy,
      },
      amountDepositedInUsd:
        BigNumber(matched?.amountDepositedInUsd) ??
        pos.amountCollateral.multipliedBy(pos.collateralToken.valueInUsd),
    };
  });
};
