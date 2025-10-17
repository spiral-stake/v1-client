import { useNavigate } from "react-router-dom";
import { CollateralToken } from "../types";

const ProductCard = ({
  collateralToken,
}: {
  collateralToken: CollateralToken
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/products/${collateralToken.address}`);
  };

  return (
    <>
      {Number(collateralToken.defaultLeverageApy) > 0 && (
        <div className="group flex flex-col cursor-default w-full border-[1px] border-white border-opacity-[6%] gap-[16px] bg-white p-[16px]  rounded-[16px] bg-opacity-[4%] hover:bg-opacity-[10%] transition-all duration-300">
          {/* first part */}
          <div className="flex justify-between items-center pb-[16px] border-b-[1px] border-white border-opacity-[6%]">
            <div className="flex items-center gap-2">
              <div>
                <img src={`/tokens/${collateralToken.symbolExtended}.svg`} alt="" className="w-[28px]" />
              </div>
              <div className="flex flex-col gap-[4px]">
                <div className="flex gap-[8px] items-center">
                  <p className="text-[16px] font-medium">{collateralToken.symbol.split("-")[1]}</p>
                  {/* <img src={infoIcon} alt="" className="w-[16px]" /> */}
                </div>
                <div className="flex items-center text-[13.4px] text-[#CCCCCC]">
                  <p>
                    {collateralToken.maturityDate} ({collateralToken.maturityDaysLeft} days)
                  </p>
                  <p></p>
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <p className="text-[20px] text-[#68EA6A]">{collateralToken.defaultLeverageApy}%</p>
              <p className="hidden group-hover:flex text-[20px] text-[#68EA6A]">
                APY
              </p>
            </div>
          </div>
          {/* second part */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[12px] text-[#CCCCCC]">Yield source</p>
              <p className="text-[16px] text-[#E4E4E4] font-normal">
                {collateralToken.info.yieldSource}
              </p>
            </div>
            <div>
              <p className="text-[12px] text-right text-[#CCCCCC]">
                Underlying collateral
              </p>
              <div className="flex text-right justify-end items-center gap-[2px]">
                {/* <img src={underlyingCollatateralIcon} alt="" className="w-[16px]" /> */}
                <p className="text-[16px] text-[#E4E4E4] font-normal">
                  {collateralToken.info.underlyingCollateral}
                </p>
              </div>
            </div>
          </div>
          {/* third part */}
          <div
            onClick={handleClick}
            className="flex cursor-pointer justify-center items-center p-[8.5px] bg-white bg-opacity-[8%] rounded-xl group-hover:bg-white"
          >
            <p className="text-[12px] text-[#FFFFFF] group-hover:text-gray-950">
              Deposit
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
