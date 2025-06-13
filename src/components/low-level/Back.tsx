import arrowIcon from "../../assets/icons/arrow.svg";

const Back = () => {
  return (
    <div className="h-5 inline-flex justify-start items-center gap-16">
      <div className="flex justify-start items-center gap-1">
        <div className="flex justify-start items-center gap-1">
          <div className="w-4 h-4 relative overflow-hidden">
            <img src={arrowIcon} alt="" />
          </div>
          <div className="text-center justify-center text-stone-50 text-base font-normal font-['Outfit']">
            Pool /
          </div>
          <div className="text-center justify-center text-zinc-400 text-base font-normal font-['Outfit']">
            frxETH{" "}
          </div>
        </div>
      </div>
      <div className="flex justify-start items-center gap-1">
        <div className="flex justify-start items-center gap-1" />
      </div>
    </div>
  );
};

export default Back;
