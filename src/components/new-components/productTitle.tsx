const ProductTitle = ({
  title,
  subheading,
  icon,
}: {
  title: string;
  subheading: string;
  icon: string;
}) => {
  return (
    <div className="w-full pb-6 cursor-default">
      <div className="flex gap-[12px] justify-start text-gray-200 text-3xl font-medium font-['Outfit']">
        <img src={icon} alt="" className="w-[36px]" />
        <p>{title}</p>
      </div>
      <div className="justify-start text-[15px] mt-2 text-[#B3B3B3] font-[Outfit] leading-normal">
        {subheading}
      </div>
    </div>
  );
};

export default ProductTitle;
