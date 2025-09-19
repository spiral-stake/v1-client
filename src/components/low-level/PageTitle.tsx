const PageTitle = ({
  title,
  subheading,
}: {
  title: string;
  subheading: string;
}) => {
  return (
    <div className="w-full pb-6 cursor-default">
      <div className="justify-start text-white text-3xl font-['Outfit'] font-normal">
        {title}
      </div>
      <div className="max-w-[650px] justify-start text-[14.5px] mt-2 text-[#B3B3B3] font-[Outfit] leading-normal">
        {subheading}
      </div>
    </div>
  );
};

export default PageTitle;
