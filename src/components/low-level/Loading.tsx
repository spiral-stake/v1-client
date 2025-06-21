import checkIconBlue from "../../assets/icons/checkIconBlue.svg";
import completedIcon from "../../assets/icons/completed.svg";

const Loading = ({
  loadingText,
  loadingTitle,
  infoComponent,
}: {
  loadingText: string;
  loadingTitle?: string;
  infoComponent?: React.ReactNode;
}) => {
  return (
    <div className="w-full py-4 bg-gradient-to-b from-slate-900 to-gray-950 rounded-xl lg:rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-800 inline-flex flex-col justify-start items-center gap-6">
      {loadingTitle && (
        <div className="rounded-full inline-flex justify-center items-center gap-2 overflow-hidden">
          <div className="flex-1 flex justify-start items-center gap-2">
            <div className="flex-1 justify-start text-white text-xl font-normal font-['Outfit']">
              {loadingTitle}
            </div>
          </div>
        </div>
      )}
      <div className="self-stretch flex flex-col justify-start items-start gap-6">
        <div className="self-stretch inline-flex justify-center items-center">
          <div className="flex-1 inline-flex flex-col justify-start items-center gap-1">
            <div className="self-stretch inline-flex justify-start items-center">
              <div className="flex-1 self-stretch" />
              <img src={checkIconBlue} alt="" />
              <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                <div className="self-stretch h-0 outline outline-2 outline-offset-[-1px] outline-blue-800" />
              </div>
            </div>
            <div className="self-stretch text-center justify-start text-white text-xs font-medium font-['Outfit'] leading-none">
              {loadingText}
            </div>
          </div>

          <div className="flex-1 inline-flex flex-col justify-start items-center gap-1">
            <div className="self-stretch inline-flex justify-start items-center">
              <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                <div className="self-stretch h-0 outline outline-2 outline-offset-[-1px] outline-gray-700" />
              </div>
              <img src={completedIcon} alt="" />
              <div className="flex-1 inline-flex flex-col justify-start items-start gap-2" />
            </div>
            <div className="self-stretch text-center justify-start text-white text-opacity-70 text-xs font-normal font-['Outfit'] leading-none">
              Completed
            </div>
          </div>
        </div>
        {infoComponent}
      </div>
    </div>
  );
};

export default Loading;
