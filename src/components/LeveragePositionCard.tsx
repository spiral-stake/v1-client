import { displayTokenAmount } from "../utils/displayTokenAmounts";
import { Link } from "react-router-dom";
import { LeveragePosition } from "../types";
import { calcLeverageApy, calcMaxLeverage } from "../utils";
import FlashLeverage from "../contract-hooks/FlashLeverage";
import ActionBtn from "./ActionBtn";
import { useAccount, useChainId } from "wagmi";
import { getInternalReswapData } from "../api-services/swapAggregator";
import { handleAsync } from "../utils/handleAsyncFunction";
import { useState } from "react";
import { toastSuccess } from "../utils/toastWrapper";
import BigNumber from "bignumber.js";

const LeveragePositionCard = ({ flashLeverage, leveragePosition, deleteLeveragePosition }: { flashLeverage: FlashLeverage, leveragePosition: LeveragePosition, deleteLeveragePosition: (positionId: number) => void }) => {
    const { chainId } = useAccount();
    const [loading, setLoading] = useState<boolean>(false);

    const appChainId = useChainId();

    const handleCloseLeveragePosition = async () => {
        const { pendleSwap, tokenRedeemSy, swapData, limitOrderData } = await getInternalReswapData(appChainId, flashLeverage, leveragePosition.collateralToken, leveragePosition.amountLeveragedCollateral)
        const amountReturned = await flashLeverage.unleverage(leveragePosition, pendleSwap, tokenRedeemSy, swapData, limitOrderData);

        deleteLeveragePosition(leveragePosition.id);
        toastSuccess("Position Closed", `Received ${displayTokenAmount(amountReturned as BigNumber, leveragePosition.collateralToken.loanToken)}`);
    }

    return (
        <Link to="">
            <div className="w-full mt-4 bg-gradient-to-l px-2 from-slate-900 to-gray-950 hover:bg-slate-800 rounded-md py-5 lg:py-2 border-y border-y-slate-800 lg:border-y-0 grid grid-cols-4 grid-rows-[1fr_1fr_2fr] lg:grid-cols-8 lg:grid-rows-1 items-center lg:pr-5 transition-all ease-out duration-150">
                <div className="col-span-4 row-span-2 lg:col-span-3 lg:row-span-1 flex justify-center items-center">
                    {/* <div className="h-16 p-3 inline-flex justify-start items-center gap-2">
                        <img src="" alt="" />
                    </div> */}
                    <div className="w-full h-16 p-3 inline-flex justify-start items-center gap-4">
                        <div className="inline-flex flex-col justify-center items-start">
                            <div className="inline-flex justify-center items-center gap-2">
                                <div className="text-lg font-semibold">
                                    {leveragePosition.collateralToken.symbol}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className=" lg:hidden">
                        <ActionBtn btnLoading={loading} text="Close" onClick={handleAsync(handleCloseLeveragePosition, setLoading)} expectedChainId={Number(chainId)} />
                    </div>
                </div>



                <div className="col-span-1 h-16 flex flex-col items-end justify-center truncate">
                    <div>{displayTokenAmount(leveragePosition.amountCollateral, leveragePosition.collateralToken)}</div>
                    <div className="text-xs">${displayTokenAmount(leveragePosition.amountCollateral.multipliedBy(leveragePosition.collateralToken.valueInUsd))}</div>
                </div>

                <div className="col-span-1 lg:col-span-1 h-16  flex flex-col items-end justify-center">
                    {calcMaxLeverage(leveragePosition.ltv)}x
                    <div className="text-xs lg:hidden">Leverage</div>
                </div>

                <div className="col-span-1 h-16 flex flex-col items-end justify-center">
                    {/* Needs to change, this is obsolete, need to calc for the apy and borrow apy of his positions */}
                    {calcLeverageApy(leveragePosition.collateralToken.impliedApy, leveragePosition.collateralToken.borrowApy, leveragePosition.ltv)}%
                    <div className="text-xs lg:hidden">Max APY</div>
                </div>

                <div className="col-span-1 h-16 flex flex-col items-end justify-center">
                    {leveragePosition.ltv}%
                    <div className="text-xs lg:hidden">LTV</div>
                    {/* <div className="text-xs">liq. {liqLtv}%</div> */}
                </div>

                <div className="hidden lg:inline-flex col-span-1 justify-end">
                    <div className="w-1/2 hidden lg:inline-block">
                        <ActionBtn btnLoading={loading} text="Close" onClick={handleAsync(handleCloseLeveragePosition, setLoading)} expectedChainId={Number(chainId)} />
                    </div>
                </div>
            </div>
        </Link >
    );
};

export default LeveragePositionCard;
