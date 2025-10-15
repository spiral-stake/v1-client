import { CollateralToken } from "../../types";
import MorphoLink from "./morphoLink";

const ProductTitle = ({
  title,
  subheading,
  maturity,
  icon,
  collateralToken,
}: {
  title: string;
  subheading: string;
  maturity: string;
  icon: string;
  collateralToken: CollateralToken;
}) => {
  return (
    <div className="w-full pb-6 cursor-default">
      <div className="flex items-center gap-[12px] justify-start text-gray-200 text-[24px] lg:text-[32px] font-medium font-['Outfit']">
        <img src={icon} alt="" className="w-[30px] h-[30px] lg:w-[36px] lg:h-[36px]" />
        <div className="flex items-baseline gap-[12px]">
          <div className="flex items-baseline gap-[4px]">
          <p>{title}</p>
          <p className="text-[15px] lg:text-[20px] h-fit font-normal">( {maturity} )</p>
          
        </div>
        <MorphoLink link={`https://app.morpho.org/ethereum/market/${collateralToken.morphoMarketId}`}/>
        </div>
      </div>
      <div className="justify-start text-[15px] mt-2 text-[#B3B3B3] font-[Outfit] leading-normal">
        {subheading}
      </div>
    </div>
  );
};

export default ProductTitle;
