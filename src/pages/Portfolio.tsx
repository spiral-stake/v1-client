import { useEffect, useState } from "react";
import Loader from "../components/low-level/Loader";
import PageTitle from "../components/low-level/PageTitle";
import PositionCard from "../components/low-level/PositionCard";
import { LeveragePosition, Position, Token } from "../types";
import { useAccount, useChainId } from "wagmi";
import PositionManager from "../contract-hooks/PositionManager";
import FlashLeverage from "../contract-hooks/FlashLeverage";
import LeveragePositionCard from "../components/low-level/LeveragePositionCard";

const Portfolio = ({ positionManager, flashLeverage }: { positionManager: PositionManager, flashLeverage: FlashLeverage }) => {
    const [positions, setPositions] = useState<Position[]>([]);
    const [leveragePositions, setLeveragePositions] = useState<LeveragePosition[]>([]);

    const { address } = useAccount();
    const chainId = useChainId();

    useEffect(() => {
        async function getUserPositions() {
            if (!chainId || !address || !positionManager || !flashLeverage) return;
            setPositions([...(await positionManager.getUserPositions(address))]);
            setLeveragePositions([...(await flashLeverage.getUserLeveragePositions(address, positionManager))]);
        }

        getUserPositions();
    }, [address, positionManager, flashLeverage]);

    return (
        <div className="pb-16">
            <div className="py-16">
                <PageTitle
                    title={"Your Positions"}
                    subheading={`Manage all your borrowing and looping positions in one place`}
                />
            </div>
            <div className="pb-10">
                <h2 className="text-xl font-semibold">Borrowing Positions</h2>
            </div>
            {positions.length ? (
                <div>
                    <div className="hidden pb-5 w-full lg:grid grid-cols-8 pr-5 border-b border-gray-900">
                        <div className="col-span-3 flex justify-center items-center pl-3">
                            <span className="w-full px-5 inline-flex justify-start items-center gap-4">
                                Collateral
                            </span>
                        </div>

                        <div className="col-span-1 flex justify-end items-center">
                            <span>Deposited</span>
                        </div>
                        <div className="col-span-1 flex justify-end items-center">
                            <span>Borrowed</span>
                        </div>
                        <div className="col-span-1 flex justify-end items-center">
                            <span>Borrow APY</span>
                        </div>
                        <div className="col-span-1 flex justify-end items-center">
                            <span>LTV</span>
                        </div>
                        <div className="col-span-1 flex justify-end items-center">
                            <span>Liq. LTV</span>
                        </div>
                    </div>
                    {/* <div className="h-0 w-full px-5 outline-[10px] outline-gray-600"/> */}
                    <div>
                        {positions.map((position: Position, index: number) => (
                            <PositionCard key={index} position={position} liqLtv={positionManager?.liqLtv} />
                        ))}
                    </div>
                </div>
            ) : (
                <Loader />
            )}


            {leveragePositions.length && (
                <>
                    <div className="py-10">
                        <h2 className="text-xl font-semibold">Looping Positions</h2>
                    </div>
                    <div>
                        <div className="hidden pb-5 w-full lg:grid grid-cols-8 pr-5 border-b border-gray-900">
                            <div className="col-span-3 flex justify-center items-center pl-3">
                                <span className="w-full px-5 inline-flex justify-start items-center gap-4">
                                    Collateral
                                </span>
                            </div>

                            <div className="col-span-1 flex justify-end items-center">
                                <span>Deposited</span>
                            </div>
                            <div className="col-span-1 flex justify-end items-center">
                                <span>Leveraged</span>
                            </div>
                            <div className="col-span-1 flex justify-end items-center">
                                <span>Position Size</span>
                            </div>
                            <div className="col-span-1 flex justify-end items-center">
                                <span>LTV</span>
                            </div>
                            <div className="col-span-1 flex justify-end items-center">
                                <span>Max APY</span>
                            </div>
                        </div>
                        {/* <div className="h-0 w-full px-5 outline-[10px] outline-gray-600"/> */}
                        <div>
                            {leveragePositions.map((leveragePosition: LeveragePosition, index: number) => (
                                <LeveragePositionCard key={index} leveragePosition={leveragePosition} liqLtv={positionManager?.liqLtv} />
                            ))}
                        </div>
                    </div></>)}
        </div>
    );
};

export default Portfolio;
