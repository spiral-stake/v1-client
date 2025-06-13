import arrowIcon from "../../assets/icons/arrowDown.svg";

const PopupNotification = ({
  title,
  text,
  icon,
  link,
}: {
  title: string;
  text: string;
  icon: string;
  link?: string;
}) => {
  return (
    <div className="w-full absolute lg:top-20 lg:right-10 lg:w-[375px] flex flex-row justify-between items-center rounded-md p-4 bg-slate-800">
      <div className="flex justify-center items-center gap-2">
        <img src={icon} alt="" className="w-7 h-7" />
        <div className="flex flex-col">
          <span className="text-base">{title}</span>
          <span className="text-xs font-light">{text}</span>
        </div>
      </div>
      {link && (
        <div>
          <img src={arrowIcon} alt="" className="w-5 h-5 -rotate-90" />
        </div>
      )}
    </div>
  );
};

export default PopupNotification;
