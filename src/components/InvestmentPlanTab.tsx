import { CollateralToken } from "../types";
import BtnGreen from "./low-level/BtnGreen";
import arrowRight from "../assets/icons/arrowRight.svg";
import { Link } from "react-router-dom";

const InvestmentPlanTab = ({
  amountInUsd,
  selected,
  collateralToken,
  desiredLtv,
  leverageApy,
}: {
  amountInUsd: number;
  selected?: boolean;
  collateralToken: CollateralToken;
  desiredLtv: string;
  leverageApy: string;
}) => {
  return (
    <Link to={`/products/${collateralToken.address}?leverage=${desiredLtv}`}>
      <div
        className={`py-[12px] lg:p-[12px] grid grid-cols-[max-content,1fr,1fr,1fr,max-content] items-center rounded-[12px] hover:bg-white hover:bg-opacity-[4%] ${selected ? "bg-white bg-opacity-[4%]" : ""
          }`}
      >
        <div className="flex items-center justify-center p-[8px] lg:p-[12px]">
          <img
            src={`/tokens/${collateralToken.symbolExtended}.svg`}
            alt=""
            className="w-[16px] lg:w-[24px]"
          />
        </div>
        <div className="text-[12px] lg:text-[16px] font-[500] text-[#D7D7D7]">{`${collateralToken.symbol}`}</div>
        <div>
          <BtnGreen text={`${leverageApy}% APY`} />
        </div>
        <div className="flex items-end gap-[8px] text-[12px] lg:text-[16px] text-[#68EA6A]">
          <p>
            +$
            {amountInUsd > 0
              ? `${((Number(leverageApy) / 100) * amountInUsd).toFixed(2)}`
              : `${((Number(leverageApy) / 100) * 10000).toFixed(2)}`}
          </p>
          <p className="hidden lg:block"><BtnGreen text="Annually" /></p>
        </div>
        <div className="p-[6px] lg:p-[12px]">
          <img src={arrowRight} alt="" className="w-[20px] lg:w-[24px]" />
        </div>
      </div>
    </Link>
  );
};

export default InvestmentPlanTab;
