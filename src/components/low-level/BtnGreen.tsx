const BtnGreen = ({ text }: { text: string }) => {
  return (
    <div className="bg-white w-fit bg-opacity-[5%] px-[8px] py-[2px] lg:px-[8px] lg:py-[3px] text-[12px] lg:text-[14px] font-normal rounded-[8px]">
      {text}
    </div>
  );
};

export default BtnGreen;
