import { CollateralToken, LeveragePosition, Metrics } from "../../types";
import account from "../../assets/icons/account.svg";
import barChart from "../../assets/icons/bar-chart.svg";
import coin from "../../assets/icons/coin-line.svg";
import { formatNumber } from "../../utils/formatNumber";
import { calcLeverage } from "../../utils";

const SpiralStakeInfo = ({
  collateralTokens,
  allLeveragePositions,
  metrics
}: {
  collateralTokens: CollateralToken[];
  allLeveragePositions: LeveragePosition[];
  metrics: Metrics[]
}) => {
  return (
    <div className="flex items-center justify-between lg:gap-[20px]">
      <div className="flex flex-col gap-[8px] lg:pr-[66px]">
        <div className="flex items-center gap-[2px] lg:gap-[4px]">
          <img src={coin} alt="" className="w-[16px]" />{" "}
          <p className="text-[12px] lg:text-[16px] text-[#B3B3B3]">Total Value Managed</p>
        </div>
        <div>
          <p className="text-[16px] lg:text-[20px] font-[500]">
            $
            {formatNumber(
              (allLeveragePositions.reduce(
                (total, pos) =>
                  total +
                  Number(calcLeverage(pos.ltv)) *
                  Number(pos.amountDepositedInUsd),
                0
              ) /
                allLeveragePositions.reduce(
                  (total, pos) => total + Number(pos.amountDepositedInUsd),
                  0
                )) *
              allLeveragePositions.reduce(
                (total, current) =>
                  total + Number(current.amountDepositedInUsd),
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
            Highest APY
          </p>
        </div>
        <div>
          <p className="text-[16px] lg:text-[20px] font-[500]">
            {" "}
            {`${(
              collateralTokens.reduce(
                (max, token) => Math.max(max, Number(token.defaultLeverageApy)),
                0
              )
            ).toFixed(2)}%`}
          </p>
        </div>
      </div>
      <div className="w-[2px] h-[24px] bg-white bg-opacity-[10%] font-normal"></div>
      <div className="flex flex-col gap-[8px] lg:pr-[66px]">
        <div className="flex items-center gap-[2px] lg:gap-[4px]">
          <img src={account} alt="" className="w-[16px]" />{" "}
          <p className="text-[12px] lg:text-[16px] text-[#B3B3B3]">
            Unique Users
          </p>
        </div>
        <div>
          <p className="text-[16px] lg:text-[20px] font-[500]">
            {metrics && metrics[metrics.length - 1].userCount}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpiralStakeInfo;
