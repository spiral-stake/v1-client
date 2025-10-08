import BigNumber from "bignumber.js";
import FlashLeverage from "../../contract-hooks/FlashLeverage";
import { CollateralToken } from "../../types";
import { calcLeverageApy } from "../../utils";
import BtnFull from "../low-level/BtnFull";
import BtnGreen from "./btnGreen";
import InvestmentPlanTab from "./investmentPlanTab";
import { useEffect, useState } from "react";
import { daysLeft } from "../../utils/daysLeft";
import Slippage from "./slippage";

const InvestmentPlans = ({
  slippage,
  maxLeverage,
  maturity,
  amountInUsd,
  collateralToken,
  flashLeverage,
  desiredLtv,
}: {
  slippage: number;
  maxLeverage: string;
  maturity: string;
  amountInUsd: number;
  collateralToken: CollateralToken;
  flashLeverage: FlashLeverage;
  desiredLtv: string;
}) => {
  return (
    <div className="flex flex-col gap-[18px]">
      {/* <div className="border-[1px] w-fit py-[8.5px] px-[10px] rounded-full">
        <p className="text-[12px]">investment plans</p>
      </div> */}
      <div className="flex items-center justify-normal gap-[0.5rem] lg:justify-normal  lg:gap-[20px] p-[8px]">
        <div className="">
          <p className="text-[16px] lg:text-[24px] font-[500]">
            ${Number(amountInUsd) || 10000}
          </p>
          <p className="text-[12px] text-[#8E8E8E]">Initial investment</p>
        </div>
        <div className="w-[2px] h-[24px] bg-white bg-opacity-[10%]"></div>

        <div className="flex flex-col">
          <div className="flex  gap-[4px]">
            <div className="flex items-center gap-[8px] text-[#68EA6A]">
              <p className="text-[16px] lg:text-[24px] font-[500]">
                +$
                {amountInUsd > 0
                  ? `${(
                      (((Number(
                        calcLeverageApy(
                          collateralToken.impliedApy,
                          collateralToken.borrowApy,
                          desiredLtv
                        )
                      ) /
                        100) *
                        amountInUsd) /
                        365) *
                        daysLeft(maturity) -
                      ((amountInUsd * Number(maxLeverage)) / 100) *
                        (0.1)
                    ).toFixed(2)}`
                  : `${(
                      (((Number(
                        calcLeverageApy(
                          collateralToken.impliedApy,
                          collateralToken.borrowApy,
                          desiredLtv
                        )
                      ) /
                        100) *
                        10000) /
                        365) *
                        daysLeft(maturity) -
                      ((10000 * Number(maxLeverage)) / 100) * 0.1
                    ).toFixed(2)}`}
              </p>
              <BtnGreen text={`in ${daysLeft(maturity)} Days`} />
            </div>
            <div className="hidden lg:inline-flex">
              <BtnGreen
                text={`${calcLeverageApy(
                  collateralToken.impliedApy,
                  collateralToken.borrowApy,
                  desiredLtv
                )}% APY`}
              />
            </div>
          </div>
          <p className="text-[12px] text-[#8E8E8E]">
            Yield Earned with Spiral Stake
          </p>
        </div>
      </div>
      <div className="p-[12px] bg-white border-[1px] border-white bg-opacity-[4%] border-opacity-[6%] rounded-[20px] rounded-b-none lg:rounded-b-[20px]">
        <InvestmentPlanTab
          amountInUsd={amountInUsd}
          desiredLtv={desiredLtv}
          collateralToken={collateralToken}
          selected
        />
        {flashLeverage.collateralTokens
          .filter(
            (newcollateralToken) =>
              newcollateralToken.symbol !== collateralToken.symbol
          )
          .sort(
            (a, b) =>
              Number(calcLeverageApy(b.impliedApy, b.borrowApy, b.safeLtv)) -
              Number(calcLeverageApy(a.impliedApy, a.borrowApy, a.safeLtv))
          )
          .slice(0, 4)
          .map((newcollateralToken, index) => (
            <InvestmentPlanTab
              amountInUsd={amountInUsd}
              key={index}
              desiredLtv={desiredLtv}
              collateralToken={newcollateralToken}
            />
          ))}
      </div>
    </div>
  );
};

export default InvestmentPlans;
