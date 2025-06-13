import BigNumber from "bignumber.js";
import { PoolInfo } from "../../types";
import { displayTokenAmount } from "../../utils/displayTokenAmounts";

const CreatePoolInfo = ({ poolInfo }: { poolInfo: PoolInfo }) => {
  return (
    <div className="px-5 py-3 self-stretch flex flex-col justify-start items-start gap-4">
      <div className="self-stretch flex flex-col justify-start items-start gap-2">
        <div className="self-stretch inline-flex justify-between items-start">
          <div className="justify-start text-white text-opacity-80 text-xs font-normal font-['Outfit']">
            Token
          </div>
          <div className="flex justify-start items-center gap-1">
            <div className="w-3 h-3 bg-white rounded-[30px]" />
            <div className="text-right justify-start text-white text-xs font-normal font-['Outfit']">
              {poolInfo.ybt?.symbol}
            </div>
          </div>
        </div>
        <div className="self-stretch inline-flex justify-between items-start">
          <div className="justify-start text-white text-opacity-80 text-xs font-normal font-['Outfit']">
            Cycle Amount
          </div>
          <div className="justify-start text-white text-xs font-normal font-['Outfit']">
            {displayTokenAmount(poolInfo.amountCycle)} {poolInfo.ybt?.baseToken.symbol}
          </div>
        </div>
        <div className="self-stretch inline-flex justify-between items-start">
          <div className="justify-start text-white text-opacity-80 text-xs font-normal font-['Outfit']">
            Total Cycles
          </div>
          <div className="justify-start text-white text-xs font-normal font-['Outfit']">
            {poolInfo.totalCycles}
          </div>
        </div>
        <div className="self-stretch inline-flex justify-between items-start">
          <div className="justify-start text-white text-opacity-80 text-xs font-normal font-['Outfit']">
            Cycle Duration
          </div>
          <div className="justify-start text-white text-xs font-normal font-['Outfit']">
            {poolInfo.cycleDuration}
          </div>
        </div>
        <div className="self-stretch inline-flex justify-between items-start">
          <div className="justify-start text-white text-opacity-80 text-xs font-normal font-['Outfit']">
            Cycle Deposit and Bid Duration
          </div>
          <div className="justify-start text-white text-xs font-normal font-['Outfit']">
            {poolInfo.cycleDepositAndBidDuration} mins {/** Needs to change at prod */}
          </div>
        </div>
        <div className="self-stretch inline-flex justify-between items-start">
          <div className="justify-start text-white text-opacity-80 text-xs font-normal font-['Outfit']">
            Starting time
          </div>
          <div className="justify-start text-white text-xs font-normal font-['Outfit']">
            {poolInfo.startInterval}
          </div>
        </div>
      </div>
      <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-zinc-900"></div>
      <div className="self-stretch inline-flex justify-between items-start">
        <div className="justify-start text-white text-opacity-80 text-xs font-normal font-['Outfit']">
          Approx collateral
        </div>
        <div className="justify-start text-white text-xs font-normal font-['Outfit']">
          {poolInfo.amountCollateral} {poolInfo.ybt?.symbol}
        </div>
      </div>
    </div>
  );
};

export default CreatePoolInfo;
