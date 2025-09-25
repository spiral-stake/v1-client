import ReviewinfoTabs from "./reviewInfoTabs";
import close from "../../assets/icons/close.svg";
import { CollateralToken, Token } from "../../types";
import FlashLeverage from "../../contract-hooks/FlashLeverage";
import ActionBtn from "../ActionBtn";
import BigNumber from "bignumber.js";
import Action from "../Action";
import { calcLeverageApy, calcMaxLeverage } from "../../utils";

const ReviewOverlay = ({
  setShowSummary,
  amountCollateral,
  collateralToken,
  handleApprove,
  token,
  completed,
  desiredLtv
}: {
  setShowSummary: React.Dispatch<React.SetStateAction<boolean>>;
  amountCollateral: string;
  collateralToken: CollateralToken;
  handleApprove: () => Promise<void>;
  token: Token;
  completed?: boolean;
  desiredLtv: string
}) => {
  return (
    <div className="flex flex-col p-[24px] backdrop-blur-2xl bg-white bg-opacity-[8%] rounded-[16px] rounded-b-none lg:rounded-b-[16px] gap-[20px] w-full lg:w-[500px] border-[1px] border-white border-opacity-[4%]">
      <div className="flex justify-between items-center text-[20px]">
        <div>
          <p className="font-[500]">Review your Deposit</p>
        </div>
        <div
          onClick={() => setShowSummary(false)}
          className="flex cursor-pointer justify-center items-center p-[2px] bg-white bg-opacity-[16%] rounded-full"
        >
          <img src={close} alt="" className="w-[24px]" />
        </div>
      </div>
      <div className="flex flex-col gap-[16px]">
        <p>Double-check the details before proceeding.</p>
        <div className="flex flex-col gap-[8px]">
          <ReviewinfoTabs
            title="Deposit Amount"
            info={`${amountCollateral} USDC`}
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
          <ReviewinfoTabs title="Leverage" info={`${calcMaxLeverage(desiredLtv)}x`} />
          <ReviewinfoTabs info={`${calcLeverageApy(collateralToken.impliedApy, collateralToken.borrowApy, desiredLtv)}% APY`} title="Estimated Yield" />
          <ReviewinfoTabs title="Your LTV" info={`${desiredLtv}%`} />
        </div>
      </div>
      <div className="flex items-center gap-[8px]">
        <button
          onClick={() => setShowSummary(false)}
          className="w-full text-[14px] border-[1px] border-white rounded-full bg-transparent text-center p-[11px]"
        >
          Cancel
        </button>
        <Action
          text="Approve"
          token={token}
          amountToken={amountCollateral}
          actionHandler={handleApprove}
          completed={completed}
        />
      </div>
    </div>
  );
};

export default ReviewOverlay;
