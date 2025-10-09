import { getSlippage } from "../../utils/getSlippage";
import SlippageTab from "./slippageTab";

const Slippage = ({
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
    <div className="flex flex-col  gap-[8px]">
      <div>
        <p className="text-[14px]">Slippage</p>
      </div>
      <div className="flex items-center justify-around p-[4px] rounded-[10px] border-[1px] border-white border-opacity-[10%]">
        <SlippageTab

          amountCollateral={amountCollateral}
          autoMode={autoMode}
          setAutoMode={setAutoMode}
          auto
          setSlippage={setSlippage}
          slippage={slippage}
          value={getSlippage(Number(amountCollateral))}
        />
        <SlippageTab

          amountCollateral={amountCollateral}
          autoMode={autoMode}
          setAutoMode={setAutoMode}
          setSlippage={setSlippage}
          slippage={slippage}
          value={0.001}
        />
        <SlippageTab

          amountCollateral={amountCollateral}
          autoMode={autoMode}
          setAutoMode={setAutoMode}
          setSlippage={setSlippage}
          slippage={slippage}
          value={0.005}
        />
        <SlippageTab

          amountCollateral={amountCollateral}
          autoMode={autoMode}
          setAutoMode={setAutoMode}
          setSlippage={setSlippage}
          slippage={slippage}
          value={0.01}
        />
      </div>
    </div>
  );
};

export default Slippage;
