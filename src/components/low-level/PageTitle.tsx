const PageTitle = ({
  title,
  subheading,
}: {
  title: string;
  subheading: string;
}) => {
  return (
    <div className="flex flex-col gap-[8px] w-full cursor-default">
      <div className="w-[75%] lg:w-full justify-start text-white text-3xl font-['Outfit'] font-normal">
        {title}
      </div>
      <div className="max-w-[650px] pr-[10px] justify-start text-[16px] text-[#B3B3B3] font-[Outfit]">
        {subheading}
      </div>
    </div>
  );
};

export default PageTitle;
