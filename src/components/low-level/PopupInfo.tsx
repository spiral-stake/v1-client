import checkIcon from "../../assets/icons/check.svg";

const PopupInfo = () => {
  return (
    <div className="self-stretch px-3 py-4 bg-gradient-to-b from-gray-950 to-slate-900 rounded-xl inline-flex justify-center items-center gap-2.5">
      <div className="flex-1 self-stretch flex justify-center items-center">
        <div className="flex-1 inline-flex flex-col justify-start items-center gap-1">
          <div className="self-stretch inline-flex justify-start items-center">
            <div className="flex-1 self-stretch outline outline-2 outline-offset-[-1px]" />
            <div className="w-8 h-8 p-2 bg-blue-800 bg-opacity-10 rounded-[88px] flex justify-center items-center gap-2">
              <div className="w-5 h-5 px-3.5 py-2 bg-blue-800 rounded-[88px] inline-flex flex-col justify-center items-center gap-2">
                <div className="w-2.5 h-2.5 relative overflow-hidden">
                  <div className="w-2 h-1.5 left-[1.62px] top-[2.66px] absolute bg-white" />
                </div>
              </div>
            </div>
            <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
              <div className="self-stretch h-0 outline outline-2 outline-offset-[-1px] outline-blue-800" />
            </div>
          </div>
          <div className="self-stretch text-center justify-start text-white text-xs font-medium font-['Outfit'] leading-none">
            Depositing
          </div>
        </div>
        <div className="flex-1 inline-flex flex-col justify-start items-center gap-1">
          <div className="self-stretch inline-flex justify-start items-center">
            <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
              <div className="self-stretch h-0 outline outline-2 outline-offset-[-1px] outline-blue-800" />
            </div>
            <div className="w-8 h-8 p-2 bg-blue-800 bg-opacity-10 rounded-[88px] flex justify-center items-center gap-2">
              <div className="w-5 h-5 px-3.5 py-2 bg-blue-800 rounded-[88px] inline-flex flex-col justify-center items-center gap-2">
                <div className="w-2.5 h-2.5 relative overflow-hidden">
                  <div className="w-2 h-1.5 left-[1.62px] top-[2.66px] absolute bg-white" />
                </div>
              </div>
            </div>
            <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
              <div className="self-stretch h-0 outline outline-2 outline-offset-[-1px] outline-blue-800" />
            </div>
          </div>
          <div className="self-stretch text-center justify-start text-white text-xs font-medium font-['Outfit'] leading-none">
            Sign Request
          </div>
        </div>
        <div className="flex-1 inline-flex flex-col justify-start items-center gap-1">
          <div className="self-stretch inline-flex justify-start items-center">
            <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
              <div className="self-stretch h-0 outline outline-2 outline-offset-[-1px] outline-gray-700" />
            </div>
            <div className="w-8 h-8 p-2 rounded-[88px] flex justify-center items-center gap-2">
              <div className="w-7 h-7 px-3.5 py-2 rounded-[88px] outline outline-1 outline-offset-[-0.89px] outline-gray-700 inline-flex flex-col justify-center items-center gap-2">
                <div className="w-2 h-2 bg-gray-700 rounded-[88px]" />
              </div>
            </div>
            <div className="flex-1 inline-flex flex-col justify-start items-start gap-2" />
          </div>
          <div className="self-stretch text-center justify-start text-white text-opacity-70 text-xs font-normal font-['Outfit'] leading-none">
            Completed
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupInfo;
