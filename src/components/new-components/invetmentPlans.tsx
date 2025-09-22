import FlashLeverage from "../../contract-hooks/FlashLeverage";
import { CollateralToken } from "../../types";
import { calcLeverageApy } from "../../utils";
import BtnFull from "../low-level/BtnFull";
import BtnGreen from "./btnGreen";
import InvestmentPlanTab from "./investmentPlanTab";

const InvestmentPlans = ({
  collateralToken,
  flashLeverage,
  desiredLtv,
}: {
  collateralToken: CollateralToken;
  flashLeverage: FlashLeverage;
  desiredLtv: string;
}) => {
  return (
    <div className="flex flex-col gap-[18px]">
      <div className="border-[1px] w-fit py-[8.5px] px-[10px] rounded-full">
        <p className="text-[12px]">investment plans</p>
      </div>
      <div className="flex items-center gap-[20px] p-[8px]">
        <div>
          <p className="text-[24px] font-[500]">$10,000</p>
          <p className="text-[14px] text-[#8E8E8E]">Max APY</p>
        </div>
        <div className="w-[2px] h-[24px] bg-white bg-opacity-[10%]"></div>

        <div className="flex flex-col">
          <div className="flex items-center text-[#68EA6A] gap-[4px]">
            <div>
              <p className="text-[24px] font-[500]">
                +${`${(
                  (
                     Number(
                    calcLeverageApy(
                      collateralToken.impliedApy,
                      collateralToken.borrowApy,
                      desiredLtv
                    )
                  )/100) *
                  10000).toFixed(2)
                }`}
              </p>
            </div>
            <BtnGreen
              text={`${calcLeverageApy(
                collateralToken.impliedApy,
                collateralToken.borrowApy,
                desiredLtv
              )}%`}
            />
          </div>
          <p className="text-[14px] text-[#8E8E8E]">Earned with spiral stake</p>
        </div>
      </div>
      <div className="p-[12px] bg-white border-[1px] border-white bg-opacity-[4%] border-opacity-[6%] rounded-[20px] rounded-b-none">
        <InvestmentPlanTab desiredLtv={desiredLtv} collateralToken={collateralToken} selected/>
        {flashLeverage.collateralTokens.filter((newcollateralToken)=>newcollateralToken.symbol!==collateralToken.symbol).map((newcollateralToken, index) => (
          <InvestmentPlanTab
            desiredLtv={desiredLtv}
            collateralToken={newcollateralToken}
          />
        ))}
      </div>
    </div>
  );
};

export default InvestmentPlans;
