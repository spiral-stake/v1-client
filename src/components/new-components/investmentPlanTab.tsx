import FlashLeverage from "../../contract-hooks/FlashLeverage";
import { CollateralToken } from "../../types";
import { calcLeverageApy } from "../../utils";
import BtnGreen from "./btnGreen";
import arrowRight from "../../assets/icons/arrowRight.svg";

const InvestmentPlanTab = ({
  selected,
  collateralToken,
  desiredLtv,
}: {
    selected?:boolean
  collateralToken: CollateralToken;
  desiredLtv: string;
}) => {
  return (
    <div
    className={`p-[12px] grid grid-cols-[max-content,1fr,1fr,1fr,1fr,max-content] items-center rounded-[12px] hover:bg-white hover:bg-opacity-[4%] ${selected?"bg-white bg-opacity-[4%]":""}`}>
      <div className="flex items-center justify-center p-[12px]">
        <img
          src={`/tokens/${collateralToken.symbol}.svg`}
          alt=""
          className="w-[24px]"
        />
      </div>
      <div className="text-[16px] font-[500] text-[#D7D7D7]">{`${
        collateralToken.symbol.split("-")[0]
      }-${collateralToken.symbol.split("-")[1]} `}</div>
      <div>
        <BtnGreen
          text={`${calcLeverageApy(
            collateralToken.impliedApy,
            collateralToken.borrowApy,
            desiredLtv
          )}%`}
        />
      </div>
      <div className="text-[16px]">
        +$
        {`${(
          (Number(
            calcLeverageApy(
              collateralToken.impliedApy,
              collateralToken.borrowApy,
              desiredLtv
            )
          ) /
            100) *
          10000
        ).toFixed(2)}`}
      </div>
      <div className="text-[16px] font-[500]">
        {`${collateralToken.name.slice(
          collateralToken.name.length - 7,
          collateralToken.name.length - 4
        )}
        ${calcLeverageApy(
          collateralToken.impliedApy,
          collateralToken.borrowApy,
          desiredLtv
        )}%`}
      </div>
      <div className="p-[12px]">
        <img src={arrowRight} alt="" className="w-[24px]" />
      </div>
    </div>
  );
};

export default InvestmentPlanTab;
