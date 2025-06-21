import Pool from "../../contract-hooks/Pool.ts";
import { Cycle, LowestBid, Position } from "../../types/index.ts";
import Input from "../low-level/Input.tsx";
import { useEffect, useState } from "react";
import { handleAsync } from "../../utils/handleAsyncFunction.ts";
import { displayTokenAmount } from "../../utils/displayTokenAmounts.ts";
import { toastSuccess } from "../../utils/toastWrapper.tsx";
import ActionBtn from "../ActionBtn.tsx";
import { HoverInfo } from "../low-level/HoverInfo.tsx";
import Loading from "../low-level/Loading.tsx";
import UserMessage from "../low-level/SuccessMsg.tsx";
import checkIconBlue from "../../assets/icons/checkIconBlue.svg";
import errorIconBig from "../../assets/icons/errorIconBig.svg";
import BidInfoRow from "../low-level/BidInfoRow.tsx";
import BigNumber from "bignumber.js";
import Countdown from "react-countdown";
import { renderCountdown, renderCountdownTag } from "../low-level/CountdownRenderer.tsx";
import { usePolling } from "../../utils/Polling.ts";

const PoolBidTab = ({
  pool,
  currentCycle,
  position,
  isCycleDepositAndBidOpen,
  showOverlay,
  closeCycleDepositWindow,
  checkCycleFinalized,
}: {
  pool: Pool;
  currentCycle: Cycle;
  position: Position;
  isCycleDepositAndBidOpen: boolean;
  showOverlay: (overlayComponent: JSX.Element | null | undefined) => void;
  closeCycleDepositWindow: () => void;
  checkCycleFinalized: () => void;
}) => {
  const [amountBid, setAmountBid] = useState("");
  const [lowestBid, setLowestBid] = useState<LowestBid>();
  const [loading, setLoading] = useState(false);
  const [actionBtn, setActionBtn] = useState({
    text: "",
    onClick: () => { },
    disabled: false,
  });

  const { stopPolling } = usePolling(updateLowestBid, 5);

  useEffect(() => {
    updateLowestBid();

    if (!isCycleDepositAndBidOpen) {
      stopPolling();
    }
  }, [currentCycle, isCycleDepositAndBidOpen]);

  const handleAmountBidChange = (e: any) => {
    setAmountBid(e.target.value);
  };

  async function updateLowestBid() {
    setLowestBid(await pool.getLowestBid(currentCycle.count));
  }

  useEffect(() => {
    const updatingActionBtn = () => {
      const _amountBid = BigNumber(amountBid);

      if (_amountBid.isZero() || _amountBid.isNaN()) {
        return setActionBtn({
          ...actionBtn,
          text: `Bid Lowest Liqudity`,
          disabled: true,
        });
      }

      if (!lowestBid) return;

      const isBidTooHigh = lowestBid.amount.isZero()
        ? _amountBid.isGreaterThan(pool.amountCollateralInBase)
        : _amountBid.isGreaterThanOrEqualTo(lowestBid.amount);

      if (isBidTooHigh) {
        return setActionBtn({
          ...actionBtn,
          text: "Bid Amount too High",
          disabled: true,
        });
      }

      return setActionBtn({
        text: `Bid Lowest Liqudity`,
        disabled: false,
        onClick: handleAsync(handleCycleBid, setLoading),
      });
    };

    updatingActionBtn();
  }, [position, currentCycle, amountBid, lowestBid]);

  useEffect(() => {
    if (!loading) return showOverlay(undefined);
    showOverlay(<div></div>);
  }, [loading]);

  const handleCycleBid = async () => {
    await pool.bidCycle(position.id, amountBid);
    toastSuccess("Bid Placed", `Lowest bid is now yours at ${amountBid} ${pool.baseToken.symbol}`);

    setAmountBid("");
    updateLowestBid();
  };

  const renderBidDetails = () => {
    // If already winner
    if (position.winningCycle) {
      return (
        <div className="">
          <UserMessage
            icon={errorIconBig}
            title={"Already won, so you can't bid."}
            message={`You've won the cycle ${position.winningCycle}, so you can't bid now.`}
          />
        </div>
      );
    }

    if (!lowestBid) return;

    // When cycleBidWindow is closed
    if (!isCycleDepositAndBidOpen) {
      // When no one has bided
      if (lowestBid.amount.isZero()) {
        return (
          <UserMessage
            icon={errorIconBig}
            title="Cycle Bid Window Closed"
            message="No Bids in this cycle, Default winner will be picked"
          />
        );
      }

      // For non-winners
      if (lowestBid.positionId !== position.id) {
        return (
          <UserMessage
            icon={errorIconBig}
            title="Cycle Bid Window Closed"
            message="The winning bid wasn't yours"
          />
        );
      }

      // For Winners
      return (
        <UserMessage
          icon={checkIconBlue}
          title="You won the Bid"
          message="You will receive the cycle amount when the cycle finalizes"
        />
      );
    }

    // When cycle window is opened
    if (lowestBid.amount.isGreaterThan(0) && lowestBid.positionId === position.id) {
      return (
        <UserMessage
          icon={checkIconBlue}
          title="Your Bid is Currently Winning"
          message={`Your bid of ${displayTokenAmount(
            lowestBid.amount,
            pool.baseToken
          )} is leading. Total bidders: ${pool.totalCycles - (currentCycle.count - 1)} `}
        />
      );
    }

    return (
      <div className="w-full inline-flex flex-col justify-start items-start gap-2">
        <BidInfoRow
          label="Current Bid"
          value={
            lowestBid.amount.isGreaterThan(0)
              ? displayTokenAmount(lowestBid.amount, pool.baseToken)
              : "-"
          }
        />
        <BidInfoRow label=" Total Bidders" value={pool.totalCycles - (currentCycle.count - 1)} />
        <BidInfoRow
          label=" Max / Start Bid:"
          value={displayTokenAmount(pool.amountCollateralInBase, pool.baseToken)}
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col justify-center gap-4">
      <div className="flex justify-between">
        <div className="flex items-center gap-1">
          <span>Cycle Bid</span>
          <HoverInfo content="Bid Lowest, to win the pooled liquidity for the cycle" />
        </div>
        <div className="px-2.5 py-2 bg-neutral-800 rounded-[33.78px] inline-flex justify-start items-center gap-1.5">
          <div className="justify-start text-neutral-300 text-xs font-normal font-['Outfit'] leading-none">
            Time left:{" "}
            <Countdown
              date={currentCycle.depositAndBidEndTime * 1000}
              renderer={renderCountdown}
              onComplete={closeCycleDepositWindow}
            />
          </div>
        </div>
      </div>

      {renderBidDetails()}

      {isCycleDepositAndBidOpen &&
        !position.winningCycle &&
        (!loading ? (
          <>
            <div className="">
              <Input
                name=""
                value={amountBid}
                onChange={handleAmountBidChange}
                inputTokenSymbol={pool.baseToken.symbol}
              />
            </div>
            <div>
              <ActionBtn
                text={actionBtn.text}
                disabled={actionBtn.disabled}
                expectedChainId={pool.chainId}
                onClick={actionBtn.onClick}
              />
            </div>
          </>
        ) : (
          <div className="relative">
            <div className="absolute z-20 w-full">
              <Loading loadingText="Bidding" />
            </div>
          </div>
        ))}

      {!isCycleDepositAndBidOpen && (
        <div className="flex justify-between w-full">
          <div>Cycle Finalizes In</div>
          <div>
            <Countdown
              date={currentCycle.depositAndBidEndTime * 1000 + 15000} // +10s
              renderer={renderCountdownTag}
              onComplete={checkCycleFinalized}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PoolBidTab;
