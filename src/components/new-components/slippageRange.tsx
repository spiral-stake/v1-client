import React from "react";
import Slippage from "./slippage";

const SlippageRange = ({
  autoMode,
  setAutoMode,
  amountCollateral,
  slippage,
  setSlippage,
}: {
  autoMode: boolean;
  setAutoMode: React.Dispatch<React.SetStateAction<boolean>>;
  amountCollateral: string;
  slippage: number;
  setSlippage: React.Dispatch<React.SetStateAction<number>>;
}) => {
  return (
    <form className="flex flex-col w-full lg:w-[267px] pb-[80px] lg:pb-[16px] gap-[12px] p-[16px] rounded-[16px] rounded-b-none lg:rounded-b-[16px] border-[1px] border-white border-opacity-[14%] backdrop-blur-lg bg-white bg-opacity-[4%]">
      <div>
        <Slippage
          autoMode={autoMode}
          setAutoMode={setAutoMode}
          amountCollateral={amountCollateral}
          slippage={slippage}
          setSlippage={setSlippage}
        />
      </div>
    </form>
  );
};

export default SlippageRange;
