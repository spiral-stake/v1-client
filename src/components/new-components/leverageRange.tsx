const  LeverageRange = ({
  setShowLTV,
  maxLeverage,
  maxLtv,
  ltv,
  handleLtvSlider,
}: {
  setShowLTV: React.Dispatch<React.SetStateAction<boolean>>;
  maxLeverage: string;
  ltv: string;
  maxLtv: string;
  handleLtvSlider: (e: any) => void;
}) => {
  return (
    <form className="flex flex-col w-[267px] gap-[12px] p-[16px] rounded-xl border-[1px] border-white border-opacity-[14%] backdrop-blur-lg bg-white bg-opacity-[4%]">
      <div className="flex flex-col mt-[-18px]">
        <div
          className="relative text-[16px] bg-white w-[40px] text-center px-2 text-black  rounded-xl top-[24px]"
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
          <p>conservative</p>
          <p>moderate</p>
          <p>aggressive</p>
        </div>
      </div>
      <button
        onClick={() => setShowLTV(false)}
        className="text-[12px] p-[8.5px] border-[1px] rounded-xl"
        type="submit"
      >
        change leverage
      </button>
    </form>
  );
};

export default LeverageRange;
