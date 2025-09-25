import Slippage from "./slippage";

const SlippageRange = ({
  slippage,
  setSlippage,
}: {
  slippage: number;
  setSlippage: React.Dispatch<React.SetStateAction<number>>;
}) => {
  return (
    <form className="flex flex-col w-full lg:w-[267px] pb-[30px] lg:pb-[16px] gap-[12px] p-[16px] rounded-[16px] rounded-b-none lg:rounded-b-[16px] border-[1px] border-white border-opacity-[14%] backdrop-blur-lg bg-white bg-opacity-[4%]">
      <div>
        <Slippage slippage={slippage} setSlippage={setSlippage} />
      </div>
    </form>
  );
};

export default SlippageRange;
