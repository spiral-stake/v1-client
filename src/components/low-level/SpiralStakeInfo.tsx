import { LeveragePosition } from "../../types";
import account from "../../assets/icons/account.svg";
import barChart from "../../assets/icons/bar-chart.svg";
import coin from "../../assets/icons/coin-line.svg";
import { formatNumber } from "../../utils/formatNumber";

const SpiralStakeInfo = ({
  allLeveragePositions,
}: {
  allLeveragePositions: LeveragePosition[];
}) => {
  return (
    <div className="flex items-center justify-between lg:gap-[20px]">
      <div className="flex flex-col gap-[8px] lg:pr-[66px]">
        <div className="flex items-center gap-[2px] lg:gap-[4px]">
          <img src={coin} alt="" className="w-[16px]" />{" "}
          <p className="text-[12px] lg:text-[16px] text-[#B3B3B3]">TVM</p>
        </div>
        <div>
          <p className="text-[16px] lg:text-[20px] font-[500]">
            $
            {formatNumber(
              allLeveragePositions.reduce(
                (total, pos) => total + Number(pos.amountDepositedInUsd),
                0
              )
            )}
          </p>
        </div>
      </div>
      <div className="w-[2px] h-[24px] bg-white bg-opacity-[10%] font-normal"></div>
      <div className="flex flex-col gap-[8px] lg:pr-[66px]">
        <div className="flex items-center gap-[2px] lg:gap-[4px]">
          <img src={barChart} alt="" className="w-[16px]" />{" "}
          <p className="text-[12px] lg:text-[16px] text-[#B3B3B3]">
            Average APY
          </p>
        </div>
        <div>
          <p className="text-[16px] lg:text-[20px] font-[500]">
            {" "}
            {`${(
              allLeveragePositions.reduce(
                (total, pos) => total + Number(pos.leverageApy),
                0
              ) / allLeveragePositions.length
            ).toFixed(2)}%`}
          </p>
        </div>
      </div>
      <div className="w-[2px] h-[24px] bg-white bg-opacity-[10%] font-normal"></div>
      <div className="flex flex-col gap-[8px] lg:pr-[66px]">
        <div className="flex items-center gap-[2px] lg:gap-[4px]">
          <img src={account} alt="" className="w-[16px]" />{" "}
          <p className="text-[12px] lg:text-[16px] text-[#B3B3B3]">
            No. of Users
          </p>
        </div>
        <div>
          <p className="text-[16px] lg:text-[20px] font-[500]">
            {formatNumber(allLeveragePositions.length, 0)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpiralStakeInfo;
