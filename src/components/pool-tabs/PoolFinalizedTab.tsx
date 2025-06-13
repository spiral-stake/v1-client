import BtnFull from "../low-level/BtnFull";
import logoBlue from "../../assets/icons/logoBlue.svg";
import { Cycle, LowestBid, Position } from "../../types";
import Pool from "../../contract-hooks/Pool";
import { displayTokenAmount } from "../../utils/displayTokenAmounts";
import { useEffect, useState } from "react";
import Countdown from "react-countdown";
import { renderCountdownTag } from "../low-level/CountdownRenderer";
import { handleAsync } from "../../utils/handleAsyncFunction";

const PoolFinalizedTab = ({
  pool,
  currentCycle,
  position,
  updatePosition,
  updateCurrentCycle,
  setPoolEnded,
}: {
  pool: Pool;
  currentCycle: Cycle;
  position: Position;
  showOverlay: (overlayComponent: JSX.Element | null | undefined) => void;
  updatePosition: (value: number) => void;
  updateCurrentCycle: () => void;
  setPoolEnded: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [lowestBid, setLowestBid] = useState<LowestBid>();

  useEffect(() => {
    const getLowestBidForCycle = async () => {
      const _lowestBid = await pool.getLowestBid(currentCycle.count);
      setLowestBid(_lowestBid);
    };

    getLowestBidForCycle();
  }, []);

  const handleClaimSpiralYield = async () => {
    if (!pool || !position) return;

    await pool.claimSpiralYield(position.id);
    updatePosition(position.id);

    // toastSuccess(
    //   `Claimed ${
    //     spiralYield.amountBase > 0 ? `${spiralYield.amountBase} ${pool.baseToken.symbol}` : ""
    //   }   ${spiralYield.amountYbt > 0 ? `& ${spiralYield.amountYbt} ${pool.ybt.symbol}` : ""}`
    // );
  };

  const renderFinalizedTab = () => {
    // For Bid winners
    if (position.winningCycle === currentCycle.count)
      return (
        <div className="flex flex-col items-center">
          <span className="text-lg mb-2">You Won!</span>
          <span className="text-xs font-light text-white text-opacity-70 mb-2">
            You received the pooled liquidity:
          </span>
          <span className="text-sm text-green-500">
            {lowestBid &&
              displayTokenAmount(
                lowestBid.amount.isGreaterThan(0) ? lowestBid.amount : pool.amountCollateralInBase,
                pool.baseToken
              )}
            {/* Need to add actual liquidity + slashed collaterals */}
          </span>
        </div>
      );

    // For non-bid winners, only if they have spiral yeild left to claim
    if (
      position.spiralYield.amountBase.isGreaterThan(0) ||
      position.spiralYield.amountYbt.isGreaterThan(0)
    ) {
      return (
        <div className="flex flex-col items-center">
          <span className="text-lg mb-2">Congratulations!</span>
          <span className="text-xs font-light text-white text-opacity-70">
            You have received Spiral Yield
          </span>
          <span className="text-sm text-green-500">
            {
              position.spiralYield.amountBase.isGreaterThan(0) &&
                displayTokenAmount(
                  position.spiralYield.amountBase,
                  pool.baseToken
                ) /** Need to add actual liquidity + slashed collaerals */
            }
            {" + "}
            {
              position.spiralYield.amountYbt.isGreaterThan(0) &&
                displayTokenAmount(
                  position.spiralYield.amountYbt,
                  pool.ybt
                ) /** Need to add actual liquidity + slashed collaerals */
            }
          </span>
          <div className="mt-2">
            <BtnFull
              text="Claim Spiral Yield"
              onClick={handleAsync(handleClaimSpiralYield, setLoading)}
              btnLoading={loading}
              disabled={loading}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center">
        <span className="text-lg mb-2">Cycle Finalized</span>
        <span className="text-xs font-light text-white text-opacity-70">
          Please wait for next cycle to start
        </span>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col justify-between gap-8 bg-gradient-to-b from-slate-900 to-gray-950 rounded-xl p-1">
      <div className="flex flex-col items-center gap-4 p-6">
        <img src={logoBlue} alt="" className="w-24 h-24 rotate-45" />
        <div className="flex flex-col gap-6 py-3">{renderFinalizedTab()}</div>
      </div>

      {currentCycle.count === pool.totalCycles ? (
        <div className="flex justify-between mt-6 p-2">
          <span className="text-sm">{`Pool ends in`}</span>
          <div>
            <Countdown
              date={currentCycle.endTime * 1000}
              renderer={renderCountdownTag}
              onComplete={setPoolEnded}
            />
          </div>
        </div>
      ) : (
        <div className="flex justify-between mt-6 p-2">
          <span className="text-sm">{`Cycle ${currentCycle.count + 1} is starting in`}</span>
          <Countdown
            date={currentCycle.endTime * 1000}
            renderer={renderCountdownTag}
            onComplete={updateCurrentCycle}
          />
        </div>
      )}
    </div>
  );
};

export default PoolFinalizedTab;
