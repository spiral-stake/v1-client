import sort from "../../assets/icons/sort.svg";

const Sort = ({
  sortMethod,
  setSortMethod,
  showSorts,
  setShowSorts,
}: {
  sortMethod: string;
  setSortMethod: React.Dispatch<React.SetStateAction<string>>;
  showSorts: boolean;
  setShowSorts: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <div className="w-full relative">
      <div
        onClick={() => setShowSorts(!showSorts)}
        className="self-end cursor-pointer lg:mx-6 flex bg-white bg-opacity-[8%] rounded-full w-fit items-center gap-[4px] px-[10px] py-[9px]"
      >
        <img src={sort} alt="" />
        <p className="text-[12px]">sort</p>
      </div>
      {showSorts && (
        <div className="absolute flex w-[150px] text-[14px] flex-col gap-[8px] rounded-[16px] bg-white bg-opacity-[8%] p-[10px] right-[20px] top-[42px] backdrop-blur-md">
          <div
            onClick={() => setSortMethod("APY")}
            className={`p-[8px] cursor-pointer rounded-[8px]  ${
              sortMethod == "APY" ? "bg-white bg-opacity-[10%]" : ""
            }`}
          >
            <p>APY (high-low)</p>
          </div>
          <div
            onClick={() => setSortMethod("leverage")}
            className={`p-[8px] cursor-pointer rounded-[8px] ${
              sortMethod == "leverage" ? "bg-white bg-opacity-[10%]" : ""
            }`}
          >
            <p>max leverage amt</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sort;
