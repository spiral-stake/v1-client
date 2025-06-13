import BigNumber from "bignumber.js";
import PositionCollateral from "../low-level/PositionCollateral";
import PositionNft from "../low-level/PositionNft";
import { useEffect, useState } from "react";
import { Cycle, Position } from "../../types";
import Pool from "../../contract-hooks/Pool";

const PoolPositionTab = ({
  position,
  pool,
  cyclesFinalized,
  currentCycle,
  updatePosition,
}: {
  position: Position;
  pool: Pool;
  currentCycle: Cycle;
  cyclesFinalized: number;
  updatePosition: (value: number) => void;
}) => {
  const [amountCollateralYield, setAmountCollateralYield] = useState<BigNumber>();

  useEffect(() => {
    async function getYbtCollateralYield() {
      const _amountCollateralYield = await pool.getCollateralYield(position);
      setAmountCollateralYield(_amountCollateralYield);
    }

    getYbtCollateralYield();
  }, [position]);

  return (
    <div className="w-full flex flex-col items-center justify-center gap-4">
      <PositionNft position={position} pool={pool} amountCollateralYield={amountCollateralYield} />
      <PositionCollateral
        pool={pool}
        position={position}
        currentCycle={currentCycle}
        cyclesFinalized={cyclesFinalized}
        updatePosition={updatePosition}
        amountCollateralYield={amountCollateralYield}
      />
    </div>
  );
};

export default PoolPositionTab;
