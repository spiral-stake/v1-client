const LeverageRange = ({
  maxLeverage,
  maxLtv,
  ltv,
  handleLtvSlider,
}: {
  maxLeverage: string;
  ltv: string;
  maxLtv: string;
  handleLtvSlider: (e: any) => void;
}) => {
  return (
    <form className="flex flex-col w-full lg:w-[267px] gap-[12px] p-[20px] pb-[30px] lg:pb-[20px] rounded-[16px] rounded-b-none lg:rounded-b-[16px] border-[1px] border-white border-opacity-[14%] backdrop-blur-3xl lg:backdrop-blur-lg bg-white bg-opacity-[10%] lg:bg-opacity-[4%]">
      <div className="flex flex-col mt-[-18px]">
        <div
          className="relative text-[15px] bg-white w-[40px] text-center px-2 text-black  rounded-xl top-[24px]"
          style={{
            left: `${((Number(ltv) || 6) / Number(maxLtv) - 0.12) * 100}%`,
          }}
        >
          {maxLeverage}x
        </div>
        <label htmlFor="leverage" className="text-[14px] mb-[8px]">
          Leverage
        </label>
        <input
          type="range"
          min="0"
          max={maxLtv}
          step="0.1"
          value={ltv || "0.00"}
          onChange={handleLtvSlider}
          className="w-full accent-white cursor-pointer"
        />
        <div className="flex mt-[4px] items-center justify-between text-[10px] text-white text-opacity-[70%]">
          <p>Conservative</p>
          <p>Moderate</p>
          <p>Aggressive</p>
        </div>
      </div>
    </form>
  );
};

export default LeverageRange;
