const UserMessage = ({
  icon,
  title,
  message,
}: {
  icon: string;
  title: string;
  message: string;
}) => {
  return (
    <div className="w-full px-3 py-4 bg-[#011B37] rounded-xl inline-flex justify-center items-center gap-2.5">
      <div className="self-stretch flex justify-start items-center gap-2">
        <img src={icon} alt="" />
      </div>
      <div className="flex-1 inline-flex flex-col justify-start items-center gap-1">
        <div className="self-stretch justify-start text-white text-sm font-medium font-['Outfit'] leading-tight">
          {title}
        </div>
        <div className="self-stretch justify-start text-white text-opacity-70 text-xs font-normal font-['Outfit'] leading-none">
          {message}
        </div>
      </div>
    </div>
  );
};

export default UserMessage;
