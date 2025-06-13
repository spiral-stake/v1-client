import infoIcon from "../../assets/icons/infoIcon.svg";

export const HoverInfo = ({ content }: { content: string }) => {
  return (
    <div className="relative inline-block group">
      <img onClick={() => {}} src={infoIcon} alt="" className="w-4 h-4 text-gray-400" />

      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <div className="w-64 -left-[15px] bottom-[2px] absolute rounded-lg backdrop-blur-lg inline-flex flex-col justify-start items-start">
          <div className="self-stretch px-3 py-2 bg-slate-800 bg-opacity-70 rounded-md flex flex-col justify-start items-start">
            <div className="self-stretch justify-start text-neutral-200 text-xs font-normal font-['Outfit'] leading-none">
              {content}
            </div>
          </div>
          {/* <div className="w-7 h-1.5 relative">
            <div className="w-6 h-0 left-[10.76px] top-[-8.49px] absolute origin-top-left rotate-45 bg-slate-800 bg-opacity-70" />
          </div> */}
        </div>
      </div>
    </div>
  );
};
