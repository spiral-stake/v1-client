import { displayTokenAmount } from "../../utils/displayTokenAmounts";
import { Link } from "react-router-dom";
import TextLoading from "./TextLoading";
import truncateStr from "../../utils/truncateStr";
import { Position } from "../../types";
import PositionManager from "../../contract-hooks/PositionManager";
import { calcLtv } from "../../utils";

const PositionCard = ({ position, liqLtv, borrowApy }: { position: Position, liqLtv: string | undefined, borrowApy: string }) => {
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
                <div className="text-lg font-semibold">
                  {position.collateralToken.symbol}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:hidden flex justify-end col-span-1 row-span-2">
          { }
        </div>

        <div className="col-span-1 h-16 flex flex-col items-end justify-center truncate">
          <div>{displayTokenAmount(position.collateralDeposited, position.collateralToken)}</div>
          <div className="text-xs">${displayTokenAmount(position.collateralValueInUsd)}</div>
        </div>

        <div className="col-span-1 lg:col-span-1 h-16  flex flex-col items-end justify-center">
          {displayTokenAmount(position.stblUSDMinted)}{" stblUSD"}
          <div className="text-xs">${displayTokenAmount(position.stblUSDMinted)}</div>
        </div>

        <div className="col-span-1 h-16 flex flex-col items-end justify-center">
          {borrowApy}%
        </div>

        <div className="col-span-1 h-16 flex flex-col items-end justify-center">
          {calcLtv(position.stblUSDMinted, position.collateralValueInUsd)}%
        </div>

        <div className="hidden lg:inline-flex col-span-1 justify-end">
          {liqLtv}%
        </div>
      </div>
    </Link >
  );
};

export default PositionCard;
