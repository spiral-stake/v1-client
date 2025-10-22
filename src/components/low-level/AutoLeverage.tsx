import auto from "../../assets/icons/autogreen.svg"

const AutoDeleverage = () => {
  return (
    <div className="relative group">
      <div className="flex items-center gap-[4px] text-[14px] text-[#68EA6A] py-[4px] px-[8px] rounded-[12px] bg-[#68EA6A] bg-opacity-[4%]">
        <img src={auto} alt="" className="w-[20px]"/>
        <p>Auto-deleverage</p>
      </div>

      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 invisible opacity-100 group-hover:visible transition-all duration-200">
        <div className="max-w-[450px] w-max -left-[80px] lg:-left-[350px] -bottom-[5px] lg:-top-[50px] absolute rounded-[14px] backdrop-blur-lg inline-flex flex-col justify-start items-start">
          <div className="self-stretch justify-start text-xs font-normal font-['Outfit'] leading-none">
            <div className=" bg-white bg-opacity-[4%] p-3 rounded-[14px] w-[160px] lg:w-full text-sm text-white/90 shadow-lg border border-white/10">
              <p className="text-[14px] text-[#D7D7D7] ">
                Your position will auto-deleverage at maturity with 0.1%
                slippage
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoDeleverage;
