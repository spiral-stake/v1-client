import ReviewinfoTabs from "./reviewInfoTabs";
import close from "../../assets/icons/close.svg";
import { CollateralToken, Token } from "../../types";
import FlashLeverage from "../../contract-hooks/FlashLeverage";
import ActionBtn from "../ActionBtn";
import BigNumber from "bignumber.js";
import Action from "../Action";
import { calcLeverageApy, calcMaxLeverage } from "../../utils";
import { daysLeft } from "../../utils/daysLeft";
import warning from "../../assets/icons/errorRed.svg";
import success from "../../assets/icons/checkGreen.svg";
import { handleAsync } from "../../utils/handleAsyncFunction";

const CloseReviewOverlay = ({
  setLoading,
  loading,
  amountCollateral,
  chainId,
  setShowCloseReview,
  collateralToken,
  handleCloseLeveragePosition,
}: {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  amountCollateral: number;
  chainId?: number;
  setShowCloseReview: React.Dispatch<React.SetStateAction<boolean>>;

  collateralToken: CollateralToken;
  handleCloseLeveragePosition: () => Promise<void>;
}) => {
  const maturity = `${collateralToken.name.slice(
    collateralToken.name.length - 9,
    collateralToken.name.length - 7
  )}${" "}
                  ${collateralToken.name.slice(
                    collateralToken.name.length - 7,
                    collateralToken.name.length - 4
                  )}${" "}
                  ${collateralToken.name.slice(
                    collateralToken.name.length - 4,
                    collateralToken.name.length
                  )}`;

  return (
    <div className="flex flex-col p-[24px] backdrop-blur-2xl bg-white bg-opacity-[8%] rounded-[16px] rounded-b-none lg:rounded-b-[16px] gap-[20px] w-full lg:w-[500px] border-[1px] border-white border-opacity-[4%]">
      <div className="flex justify-between items-center text-[20px]">
        <div className="flex gap-[3.5px] items-center">
          <img
            src={`/tokens/${collateralToken.symbol}.svg`}
            alt=""
            className="w-[32px]"
          />
          <p className="font-[500]">Review before closing your position</p>
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
          {daysLeft(maturity) > 0 ? (
            <div className="flex items-start gap-[4px]">
              <img src={warning} alt="" className="w-[24px]" />
              <p className="text-[14px]">
                Your position has not matured yet please wait till maturity to
                realise maximum yield
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
            info={`${amountCollateral.toFixed(2)} ${
              collateralToken.symbol.split("-")[1]
            }`}
          />
          <ReviewinfoTabs
            title="Maturity Date"
            info={`${collateralToken.name.slice(
              collateralToken.name.length - 9,
              collateralToken.name.length - 7
            )}${" "}
                  ${collateralToken.name.slice(
                    collateralToken.name.length - 7,
                    collateralToken.name.length - 4
                  )}${" "}
                  ${collateralToken.name.slice(
                    collateralToken.name.length - 4,
                    collateralToken.name.length
                  )}`}
          />
        </div>
      </div>
      <div className="flex items-center gap-[8px]">
        <button
          onClick={() => setShowCloseReview(false)}
          className="w-full text-[14px] border-[1px] border-white rounded-full bg-transparent text-center p-[11px]"
        >
          Cancel
        </button>
        
      </div>
    </div>
  );
};

export default CloseReviewOverlay;
