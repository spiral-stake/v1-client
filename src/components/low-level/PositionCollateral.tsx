import BigNumber from "bignumber.js";
import infoIcon from "../../assets/icons/infoIcon.svg";
import Pool from "../../contract-hooks/Pool";
import { Cycle, Position } from "../../types";
import { displayTokenAmount } from "../../utils/displayTokenAmounts";
import { toastSuccess } from "../../utils/toastWrapper";
import { ClipLoader } from "react-spinners";
import { useState } from "react";
import { handleAsync } from "../../utils/handleAsyncFunction";
import { HoverInfo } from "./HoverInfo";

const PositionCollateral = ({
  position,
  pool,
  cyclesFinalized,
  currentCycle,
  updatePosition,
  amountCollateralYield,
}: {
  position: Position;
  pool: Pool;
  currentCycle: Cycle;
  cyclesFinalized: number;
  updatePosition: (value: number) => void;
  amountCollateralYield: BigNumber | undefined;
}) => {
  const [loading, setLoading] = useState(false);

  const handleClaimCollateralYield = async () => {
    await pool.claimCollateralYield(position.id);
    toastSuccess(`Claimed Collateral Yield`, `Claimed ${amountCollateralYield} ${pool.ybt.symbol}`);
    updatePosition(position.id);
  };

  return (
    <>
      <div className="self-stretch px-3 py-2 bg-white bg-opacity-10 rounded-xl inline-flex flex-col justify-start items-start gap-3">
        <div className="self-stretch inline-flex justify-start items-center gap-2">
          <div className="w-full flex justify-between items-center gap-1">
            <div className="flex items-center justify-center gap-1">
              <div>Your YBT Collateral</div>
              <HoverInfo content="Collateral released back for successful cycle deposits and slashed for missed ones." />
            </div>

            {amountCollateralYield && amountCollateralYield.isGreaterThan(0) && (
              <button
                className="rounded-lg text-xs font-light outline outline-[1px] outline-white px-2"
                onClick={handleAsync(handleClaimCollateralYield, setLoading)}
              >
                {!loading ? "Claim YBT yield" : <ClipLoader size={"10px"} color="white" />}
              </button>
            )}
          </div>
        </div>
        <div className="self-stretch inline-flex justify-start items-center gap-3">
          <div className="flex-1 inline-flex flex-col justify-center items-start">
            <div className="justify-start text-neutral-200 text-xs font-medium font-['Outfit'] leading-normal">
              ~
              {cyclesFinalized !== currentCycle.count &&
              position.cyclesDeposited[currentCycle.count]
                ? displayTokenAmount(
                    pool.amountCycle.multipliedBy(pool.totalCycles - (cyclesFinalized + 1)),
                    pool.baseToken
                  )
                : displayTokenAmount(
                    pool.amountCycle.multipliedBy(pool.totalCycles - cyclesFinalized),
                    pool.baseToken
                  )}
            </div>
            <div className="text-xs inline-flex justify-start items-center gap-1 text-neutral-400 font-light">
              Remaining
            </div>
          </div>
          <div className="w-6 h-0 origin-top -rotate-90 outline outline-1 outline-offset-[-0.50px] outline-gray-800"></div>
          <div className="flex-1 inline-flex flex-col justify-center items-start">
            <div className="justify-start text-neutral-200 text-xs font-medium font-['Outfit'] leading-normal">
              ~
              {displayTokenAmount(
                pool.amountCycle.multipliedBy(
                  position.cyclesDeposited.filter((deposited) => deposited).length
                ),
                pool.baseToken
              )}
            </div>
            <div className="text-xs inline-flex justify-start items-center gap-1 text-neutral-400 font-light">
              Released
            </div>
          </div>
          <div className="w-6 h-0 origin-top -rotate-90 outline outline-1 outline-offset-[-0.50px] outline-gray-800"></div>
          <div className="flex-1 inline-flex flex-col justify-center items-start">
            <div className="justify-start text-neutral-200 text-xs font-medium font-['Outfit'] leading-normal">
              ~
              {displayTokenAmount(
                pool.amountCycle.multipliedBy(
                  position.cyclesDeposited
                    .slice(1, cyclesFinalized + 1)
                    .filter((deposited) => !deposited).length
                ),
                pool.baseToken
              )}
            </div>
            <div className="text-xs inline-flex justify-start items-center gap-1 text-neutral-400 font-light">
              Slashed
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PositionCollateral;
