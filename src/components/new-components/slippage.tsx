import SlippageTab from "./slippageTab";

const Slippage = ({
  slippage,
  setSlippage,
}: {
  slippage: number;
  setSlippage: React.Dispatch<React.SetStateAction<number>>;
}) => {
  return (
    <div className="flex flex-col gap-[8px]">
      <div>
        <p>Slippage</p>
      </div>
      <div className="flex items-center justify-around p-[4px] rounded-[10px] border-[1px] border-white border-opacity-[10%]">
        <SlippageTab
          setSlippage={setSlippage}
          slippage={slippage}
          value={0.001}
        />
        <SlippageTab
          setSlippage={setSlippage}
          slippage={slippage}
          value={0.005}
        />
        <SlippageTab
          setSlippage={setSlippage}
          slippage={slippage}
          value={0.01}
        />
      </div>
    </div>
  );
};

export default Slippage;
