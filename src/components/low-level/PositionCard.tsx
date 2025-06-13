import { displayTokenAmount } from "../../utils/displayTokenAmounts";
import { Link } from "react-router-dom";
import TextLoading from "./TextLoading";
import truncateStr from "../../utils/truncateStr";
import { Position } from "../../types";

const PositionCard = ({ position }: { position: Position }) => {
  return (
    <Link to="">
      <div className="w-full mt-4 bg-gradient-to-l from-slate-900 to-gray-950 hover:bg-slate-800 rounded-md py-5 lg:py-2 border-y border-y-slate-800 lg:border-y-0 grid grid-cols-[1.3fr_1.8fr_2.2fr_2.2fr] grid-rows-[1fr_1fr_2fr] lg:grid-cols-8 lg:grid-rows-1 items-center lg:pr-5 transition-all ease-out duration-150">
        <div className="col-span-3 row-span-2 lg:col-span-3 lg:row-span-1 flex justify-center items-center">
          <div className="h-16 p-3 inline-flex justify-start items-center gap-2">
            <img src="" alt="" />
          </div>
          <div className="w-full h-16 p-3 inline-flex justify-start items-center gap-4">
            <div className="inline-flex flex-col justify-center items-start">
              <div className="inline-flex justify-center items-center gap-2">
                <div className="flex-1 justify-center text-zinc-300 text-base font-medium font-['Outfit']">
                  sfrxUSD
                </div>
              </div>
              <div className="justify-center text-neutral-400 text-sm font-normal font-['Outfit']">
                Something
              </div>
            </div>
          </div>
        </div>

        <div className="lg:hidden flex justify-end col-span-1 row-span-2">
          1
        </div>

        <div className="col-span-1 h-16 inline-flex justify-end items-center truncate">
          2
        </div>

        <div className="col-span-1 lg:col-span-1 h-16  inline-flex items-center justify-end gap-0 lg:gap-4">
          3
        </div>

        <div className="col-span-1 lg:col-span-1 h-16  inline-flex justify-end items-center gap-4">
          4
        </div>

        <div className="col-span-1 lg:col-span-1 h-16  inline-flex justify-end items-center ">
          5
        </div>

        <div className="hidden lg:inline-flex col-span-1 justify-end">
          None
        </div>
      </div>
    </Link >
  );
};

export default PositionCard;
