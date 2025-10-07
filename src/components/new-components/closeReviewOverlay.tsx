import ReviewinfoTabs from "./reviewInfoTabs";
import close from "../../assets/icons/close.svg";
import { CollateralToken } from "../../types";
import { daysLeft } from "../../utils/daysLeft";
import warning from "../../assets/icons/errorRed.svg";
import success from "../../assets/icons/checkGreen.svg";

const CloseReviewOverlay = ({
  amountCollateral,
  setShowCloseReview,
  collateralToken,
}: {
  amountCollateral: number;
  setShowCloseReview: React.Dispatch<React.SetStateAction<boolean>>;
  collateralToken: CollateralToken;
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
    <div className="flex flex-col p-[24px] lg:backdrop-blur-2xl lg:bg-white lg:bg-opacity-[8%] rounded-[16px] rounded-b-none lg:rounded-b-[16px] gap-[20px] w-full lg:w-[500px] border-[1px] border-b-0 lg:border-b-[1px] border-white border-opacity-[4%]">
      <div className="flex justify-between items-center text-[20px]">
        <div className="flex gap-[8px] items-center">
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
    </div>
  );
};

export default CloseReviewOverlay;
