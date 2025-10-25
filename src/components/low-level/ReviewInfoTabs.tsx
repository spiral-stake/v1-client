import { HoverInfo } from "./HoverInfo";

const ReviewinfoTabs = ({
  title,
  hoverInfo,
  info,
  extraInfo,
}: {
  title: string;
  hoverInfo?: string;
  info: string;
  extraInfo?: string;
}) => {
  return (
    <div className="bg-white text-[14px] bg-opacity-[8%] border-[1px] border-white border-opacity-[10%] rounded-xl px-[16px] py-[12px] grid grid-cols-[40%,60%]">
      <div className="flex gap-1 items-center">
        <p className="text-white text-opacity-[70%]">{title}</p>
        {hoverInfo && <HoverInfo content={<p className="text-[13px] p-2 rounded-md max-w-[240px] bg-[#37373f]">{hoverInfo}</p>} />}
      </div>

      <div className="flex gap-1 items-center">
        <p>{info}</p>
        <p className="text-[14px] text-[#D7D7D7]">{extraInfo}</p>
      </div>
    </div>
  );
};

export default ReviewinfoTabs;
