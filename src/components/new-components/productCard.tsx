import { useNavigate } from "react-router-dom";
import infoIcon from "../../assets/icons/infoIcon.svg";
import { daysLeft } from "../../utils/daysLeft";

const ProductCard = ({
  icon,
  name,
  maturity,
  apy,
  yieldSource,
  underlyingCollatateralIcon,
  underlyingCollatateralName,
  collateralTokenAddress,
}: {
  icon: string;
  name: string;
  maturity: string;
  apy: string;
  yieldSource: string;
  underlyingCollatateralIcon: string;
  underlyingCollatateralName: string;
  collateralTokenAddress: string;
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/products/${collateralTokenAddress}`);
  };

  return (
    <div className="group flex flex-col cursor-default w-full border-[1px] border-white border-opacity-[6%] gap-[16px] bg-white p-[16px]  rounded-xl bg-opacity-[4%] hover:bg-opacity-[10%] transition-all duration-300">
      {/* first part */}
      <div className="flex justify-between items-center pb-[16px] border-b-[1px] border-white border-opacity-[6%]">
        <div className="flex items-center gap-2">
          <div>
            <img src={icon} alt="" className="w-[28px]" />
          </div>
          <div className="flex flex-col gap-[4px]">
            <div className="flex gap-[8px] items-center">
              <p className="text-[16px] font-[500]">{name}</p>
              {/* <img src={infoIcon} alt="" className="w-[16px]" /> */}
            </div>
            <div className="flex items-center text-[14px] text-[#CCCCCC]">
              <p>{maturity} ({daysLeft(maturity)} days)</p>
              <p></p>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <p className="text-[20px] text-[#68EA6A]">{apy}%</p>
          <p className="hidden group-hover:flex text-[20px] text-[#68EA6A]">
            APY
          </p>
        </div>
      </div>
      {/* second part */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-[12px] text-[#CCCCCC]">Yield source</p>
          <p className="text-[16px] text-[#E4E4E4]">{yieldSource}</p>
        </div>
        <div>
          <p className="text-[12px] text-[#CCCCCC]">Underlying collateral</p>
          <div className="flex justify-end items-center gap-[2px]">
            <img src={underlyingCollatateralIcon} alt="" className="w-[16px]" />
            <p className="text-[16px] text-[#E4E4E4]">
              {underlyingCollatateralName}
            </p>
          </div>
        </div>
      </div>
      {/* third part */}
      <div
        onClick={handleClick}
        className="flex cursor-pointer justify-center items-center p-[8.5px] bg-white bg-opacity-[8%] rounded-xl group-hover:bg-white"
      >
        <p className="text-[12px] text-[#CCCCCC] group-hover:text-gray-950">
          Deposit
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
