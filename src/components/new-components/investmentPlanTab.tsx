import { CollateralToken } from "../../types";
import { calcLeverageApy } from "../../utils";
import BtnGreen from "./btnGreen";
import arrowRight from "../../assets/icons/arrowRight.svg";
import { Link, useNavigate } from "react-router-dom";

const InvestmentPlanTab = ({
  amountInUsd,
  selected,
  collateralToken,
  desiredLtv,
}: {
  amountInUsd: number;
  selected?: boolean;
  collateralToken: CollateralToken;
  desiredLtv: string;
}) => {
  return (
    <Link to={`/products/${collateralToken.address}?leverage=${desiredLtv}`}>
      <div
        className={`p-[12px] grid grid-cols-[max-content,1fr,1fr,1fr,max-content] items-center rounded-[12px] hover:bg-white hover:bg-opacity-[4%] ${
          selected ? "bg-white bg-opacity-[4%]" : ""
        }`}
      >
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
            )}% APY`}
          />
        </div>
        <div className="text-[16px] text-[#68EA6A]">
          +$
          {amountInUsd > 0
            ? `${(
                (Number(
                  calcLeverageApy(
                    collateralToken.impliedApy,
                    collateralToken.borrowApy,
                    desiredLtv
                  )
                ) /
                  100) *
                amountInUsd
              ).toFixed(2)}`
            : `${(
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
        <div className="p-[12px]">
          <img src={arrowRight} alt="" className="w-[24px]" />
        </div>
      </div>
    </Link>
  );
};

export default InvestmentPlanTab;
