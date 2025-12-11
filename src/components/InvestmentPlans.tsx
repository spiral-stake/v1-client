import FlashLeverage from "../contract-hooks/FlashLeverage";
import { CollateralToken } from "../types";
import BtnGreen from "./low-level/BtnGreen";
import InvestmentPlanTab from "./InvestmentPlanTab";
import { getNetYieldUsd } from "../utils/getNetYieldUsd";
import { formatNumber } from "../utils/formatNumber";

const InvestmentPlans = ({
  leverage,
  leverageApy,
  amountCollateral,
  collateralToken,
  flashLeverage,
  desiredLtv,
}: {
  leverage: string;
  leverageApy: string;
  amountCollateral: number;
  collateralToken: CollateralToken;
  flashLeverage: FlashLeverage;
  desiredLtv: string;
}) => {
  const defaultamountCollateral = 100000;
  const defaultDaysLeft = 365;

  return (
    <div className="flex flex-col gap-[18px]">
      {/* <div className="border-[1px] w-fit py-[8.5px] px-[10px] rounded-full">
        <p className="text-[12px]">investment plans</p>
      </div> */}
      <div className="flex items-center justify-normal gap-[0.5rem] lg:justify-normal  lg:gap-[20px] pb-[8px]">
        <div className="">
          <p className="text-[16px] lg:text-[24px] font-[500]">
            ${formatNumber(amountCollateral || defaultamountCollateral)}
          </p>
          <p className="text-[12px] text-[#8E8E8E]">Initial investment</p>
        </div>
        <div className="w-[2px] h-[24px] bg-white bg-opacity-[10%]"></div>

        <div className="flex flex-col">
          <div className="flex items-center  gap-[4px]">
            <div className="relative inline-block group">
              <div className="flex items-center gap-[8px] text-[#68EA6A]">
                <p className="text-[16px] lg:text-[24px] font-[500]">
                  +$
                  {Math.max(Number(getNetYieldUsd(amountCollateral || defaultamountCollateral, leverageApy, leverage, collateralToken.maturityDaysLeft || 365)), 0)}
                </p>
                <BtnGreen
                  text={`in ${collateralToken.maturityDaysLeft || defaultDaysLeft} Days`}
                />
              </div>

              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 invisible opacity-100 group-hover:visible transition-all duration-200">
                <div className="max-w-[450px] w-max -left-[80px] lg:-left-[50px] -bottom-[5px] absolute rounded-[14px] backdrop-blur-lg inline-flex flex-col justify-start items-start">
                  <div className="self-stretch justify-start text-xs font-normal font-['Outfit'] leading-none">
                    <div className=" bg-white bg-opacity-[4%] p-3 rounded-[14px] w-[160px] lg:w-full text-sm text-white/90 shadow-lg border border-white/10">
                      <p className="text-[14px] text-[#D7D7D7] ">
                        After 0.1% Slippage & 10% Performance Fee on Yield Generated
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden h-fit lg:inline-flex">
              <BtnGreen text={`${leverageApy}% APY`} />
            </div>
          </div>
          <p className="text-[12px] text-[#8E8E8E]">
            Estimated Yield With Spiral Stake
          </p>
        </div>
      </div>
      <div className="p-[12px] bg-white border-[1px] border-white bg-opacity-[4%] border-opacity-[6%] rounded-[20px] rounded-b-none lg:rounded-b-[20px]">
        <InvestmentPlanTab
          amountCollateral={amountCollateral}
          desiredLtv={desiredLtv}
          collateralToken={collateralToken}
          selected
          leverageApy={leverageApy}
        />
        {flashLeverage.collateralTokens
          .filter(
            (newcollateralToken) =>
              newcollateralToken.symbol !== collateralToken.symbol
          )
          .sort(
            (a, b) =>
              Number(b.defaultLeverageApy) - Number(a.defaultLeverageApy)
          )
          .slice(0, 4)
          .map((newcollateralToken, index) => (
            <InvestmentPlanTab
              amountCollateral={amountCollateral}
              key={index}
              desiredLtv={desiredLtv}
              collateralToken={newcollateralToken}
              leverageApy={newcollateralToken.defaultLeverageApy}
            />
          ))}
      </div>
    </div>
  );
};

export default InvestmentPlans;
