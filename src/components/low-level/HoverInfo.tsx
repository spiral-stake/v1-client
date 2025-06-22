import infoIcon from "../../assets/icons/infoIcon.svg";

export const HoverInfo = ({ content }: { content: JSX.Element }) => {
  return (
    <div className="relative inline-block group">
      <img onClick={() => { }} src={infoIcon} alt="" className="w-4 h-4" />

      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <div className="max-w-[200px] w-max -left-[15px] bottom-[2px] absolute rounded-lg backdrop-blur-lg inline-flex flex-col justify-start items-start">
          <div className="self-stretch px-3 py-2 bg-slate-800 bg-opacity-70 rounded-md flex flex-col justify-start items-start">
            <div className="self-stretch justify-start text-neutral-200 text-xs font-normal font-['Outfit'] leading-none">
              {content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
