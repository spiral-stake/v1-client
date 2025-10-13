import { LeveragePosition } from "../types/index";

export const updatePositionsImpliedApy = (
  allLeveragePositions: any[],
  address: string,
  leveragePositions: LeveragePosition[]
): LeveragePosition[] => {
  const addressPrefix = address.toLowerCase();

  // Build lookup table only for positions that belong to this user
  const positionsToImpliedApy = Object.fromEntries(
    allLeveragePositions
      .filter(({ positionId }) => positionId.startsWith(addressPrefix))
      .map((pos) => [pos.positionId.slice(42), pos.atImpliedApy])
  );

  return leveragePositions.map((pos) => {
    return {
      ...pos,
      collateralToken: {
        ...pos.collateralToken,
        impliedApy: positionsToImpliedApy[pos.id] ?? pos.collateralToken.impliedApy,
      },
    };
  });
};
