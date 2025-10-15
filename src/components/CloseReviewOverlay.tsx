import ReviewinfoTabs from "./low-level/ReviewInfoTabs";
import close from "../assets/icons/close.svg";
import { CollateralToken } from "../types";
import warning from "../assets/icons/warning.svg";
import success from "../assets/icons/checkGreen.svg";
import { isMatured } from "../utils";

const CloseReviewOverlay = ({
  amountCollateral,
  setShowCloseReview,
  collateralToken,
}: {
  amountCollateral: number;
  setShowCloseReview: React.Dispatch<React.SetStateAction<boolean>>;
  collateralToken: CollateralToken;
}) => {
  return (
    <div className="flex flex-col p-[24px] lg:backdrop-blur-2xl lg:bg-white lg:bg-opacity-[8%] rounded-[16px] rounded-b-none lg:rounded-b-[16px] gap-[20px] w-full lg:w-[500px] border-[1px] border-b-0 lg:border-b-[1px] border-white border-opacity-[4%]">
      <div className="flex justify-between items-center text-[20px]">
        <div className="flex gap-[8px] items-center">
          <img
            src={`/tokens/${collateralToken.symbolExtended}.svg`}
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
          {!isMatured(collateralToken) ? (
            <div className="flex items-start gap-2 rounded-xl">
              <img src={warning} alt="Warning" className="w-10" />
              <p className="text-sm leading-relaxed text-amber-500">
                PTs reach full value only at maturity, causing yields to spike then.{" "}
                Leverage or unlever actions incur at least <span className="font-medium">0.1% slippage</span>.{" "}
                If your APY has dropped, it usually recovers as borrow rate spikes subside and pool utilization falls below{" "}
                <span className="font-medium">90%</span>. Frequent adjustments can erode returns —{" "}
                <span className="font-medium">holding your position often pays off.</span>
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
            title="Amount"
            info={`${amountCollateral.toFixed(2)} ${collateralToken.symbol
              }`}
          />
          <ReviewinfoTabs
            title="Maturity Date"
            info={collateralToken.maturityDate}
          />
        </div>
      </div>
    </div>
  );
};

export default CloseReviewOverlay;
