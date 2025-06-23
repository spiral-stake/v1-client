import { displayTokenAmount } from "../../utils/displayTokenAmounts";
import { Link } from "react-router-dom";
import TextLoading from "./TextLoading";
import truncateStr from "../../utils/truncateStr";
import { LeveragePosition, Position } from "../../types";
import PositionManager from "../../contract-hooks/PositionManager";
import { calcLeverageApy, calcLtv, calcMaxLeverage } from "../../utils";
import BigNumber from "bignumber.js";

const LeveragePositionCard = ({ leveragePosition, liqLtv }: { leveragePosition: LeveragePosition, liqLtv: string | undefined }) => {
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
                                    {leveragePosition.debtPosition.collateralToken.symbol}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:hidden flex justify-end col-span-1 row-span-2">
                    { }
                </div>

                <div className="col-span-1 h-16 flex flex-col items-end justify-center truncate">
                    <div>{displayTokenAmount(leveragePosition.userCollateralDeposited, leveragePosition.debtPosition.collateralToken)}</div>
                    <div className="text-xs">${displayTokenAmount(leveragePosition.userCollateralDepositedValueInUsd)}</div>
                </div>

                <div className="col-span-1 lg:col-span-1 h-16  flex flex-col items-end justify-center">
                    {calcMaxLeverage(calcLtv(leveragePosition.debtPosition.stblUSDMinted, leveragePosition.debtPosition.collateralValueInUsd))}x
                </div>

                <div className="col-span-1 h-16 flex flex-col items-end justify-center">
                    {displayTokenAmount(leveragePosition.debtPosition.collateralDeposited, leveragePosition.debtPosition.collateralToken)}
                    <div className="text-xs">${displayTokenAmount(leveragePosition.debtPosition.collateralValueInUsd)}</div>
                </div>

                <div className="col-span-1 h-16 flex flex-col items-end justify-center">
                    {calcLtv(leveragePosition.debtPosition.stblUSDMinted, leveragePosition.debtPosition.collateralValueInUsd)}%
                    <div className="text-xs">liq. {liqLtv}%</div>
                </div>

                <div className="hidden lg:inline-flex col-span-1 justify-end">
                    {/* Needs to change, this is obsolete, need to calc for the apy and borrow apy of his positions */}
                    {calcLeverageApy(leveragePosition.debtPosition.collateralToken.apy, leveragePosition.debtPosition.borrowApy.toFixed(2), calcLtv(leveragePosition.debtPosition.stblUSDMinted, leveragePosition.debtPosition.collateralValueInUsd))}%
                </div>
            </div>
        </Link >
    );
};

export default LeveragePositionCard;
