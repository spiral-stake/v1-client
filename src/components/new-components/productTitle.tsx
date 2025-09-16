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
      <div className="justify-start text-sm mt-2 text-stone-300 font-[Outfit] font-light leading-normal">
        {subheading}
      </div>
    </div>
  );
};

export default ProductTitle;
