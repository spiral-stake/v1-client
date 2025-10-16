import ReviewinfoTabs from "./low-level/ReviewInfoTabs";
import close from "../assets/icons/close.svg";
import { LeveragePosition } from "../types";
import warning from "../assets/icons/warning.svg";
import success from "../assets/icons/checkGreen.svg";
import { isMatured } from "../utils";
import { displayTokenAmount } from "../utils/displayTokenAmounts";
import BigNumber from "bignumber.js";

const CloseReviewOverlay = ({
  leveragePosition,
  amountCollateral,
  setShowCloseReview,
  amountReturnedSimulated,
}: {
  amountCollateral: number;
  setShowCloseReview: React.Dispatch<React.SetStateAction<boolean>>;
  leveragePosition: LeveragePosition;
  amountReturnedSimulated: BigNumber;
}) => {
  console.log(leveragePosition.amountDepositedInUsd.toString(), amountReturnedSimulated.toString());

  return (
    <div className="flex flex-col p-[24px] lg:backdrop-blur-2xl lg:bg-white lg:bg-opacity-[8%] rounded-[16px] rounded-b-none lg:rounded-b-[16px] gap-[20px] w-full lg:w-[500px] border-[1px] border-b-0 lg:border-b-[1px] border-white border-opacity-[4%]">
      <div className="flex justify-between items-center text-[20px]">
        <div className="flex gap-[8px] items-center">
          <img
            src={`/tokens/${leveragePosition.collateralToken.symbolExtended}.svg`}
            alt=""
            className="w-[32px]"
          />
          <p className="font-[500]">Review Before Closing</p>
        </div>
        <div
          onClick={() => setShowCloseReview(false)}
          className="flex cursor-pointer justify-center items-center p-[2px] bg-white bg-opacity-[16%] rounded-full"
        >
          <img src={close} alt="" className="w-[24px]" />
        </div>
      </div>
      <div className="flex flex-col gap-[16px]">
        <p>
          {!isMatured(leveragePosition.collateralToken) ? (
            <div className="flex items-start gap-2 rounded-xl">
              <img src={warning} alt="Warning" className="w-10" />
              <p className="text-sm leading-relaxed text-amber-500">
                Yields spike at maturity — that’s how bonds work. PTs reach full value only then —
                positions should be strictly unleveraged at maturity. Leverage or unwinding actions
                face at least <span className="font-medium">0.1% slippage</span>. <br />
                <br />
                If APY drops, it usually recovers as borrow rates ease and utilization falls.
                Frequent rebalancing erode returns —{" "}
                <span className="font-medium">holding often pays off.</span>
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-[4px]">
              <img src={success} alt="" className="w-[16px]" />
              <p className="text-[14px]">
                Your position has been matured please withdraw your amount
              </p>
            </div>
          )}
        </p>
        <div className="flex flex-col gap-[8px]">
          <ReviewinfoTabs
            title="Amount Deposited"
            info={`${amountCollateral.toFixed(2)} ${leveragePosition.collateralToken.symbol}`}
            extraInfo={`$${displayTokenAmount(leveragePosition.amountDepositedInUsd)}`}
          />
          {!isMatured(leveragePosition.collateralToken) ? (
            <ReviewinfoTabs
              title="Maturity Date"
              info={leveragePosition.collateralToken.maturityDate}
            />
          ) : (
            <ReviewinfoTabs
              title="Effective Yield"
              info={`$${displayTokenAmount(
                BigNumber.max(
                  0,
                  amountReturnedSimulated.minus(leveragePosition.amountDepositedInUsd)
                )
              )}`}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CloseReviewOverlay;
