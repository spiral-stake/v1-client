import { useEffect, useState } from "react";
import Loader from "../components/low-level/Loader";
import PageTitle from "../components/low-level/PageTitle";
import { LeveragePosition, Position } from "../types";
import { useAccount, useChainId } from "wagmi";
import FlashLeverage from "../contract-hooks/FlashLeverage";
import LeveragePositionCard from "../components/LeveragePositionCard";

const Portfolio = ({
    flashLeverage,
}: {
    flashLeverage: FlashLeverage;
}) => {
    const [positions, setPositions] = useState<Position[]>([]);
    const [leveragePositions, setLeveragePositions] = useState<LeveragePosition[]>([]);
    const [showLoader, setShowLoader] = useState(true)

    const { address } = useAccount();
    const chainId = useChainId();

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowLoader(false);
        }, 1500); // 1.5 seconds

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        async function getUserPositions() {
            if (!chainId || !address) return;

            if (flashLeverage) {
                setLeveragePositions([
                    ...(await flashLeverage.getUserLeveragePositions(address)),
                ]);
            }
        }

        getUserPositions();
    }, [address, flashLeverage]);

    function deleteLeveragePosition(positionId: number) {
        setLeveragePositions(prev =>
            prev.filter(position => position.id !== positionId)
        );
    }

    return (
        flashLeverage ? (<div className="pb-16">
            <div className="py-16">
                <PageTitle
                    title={"Your Leveraged Positions"}
                    subheading={`Manage all your borrowing and looping positions in one place`}
                />
            </div>
            {showLoader ? (
                <Loader />
            ) : leveragePositions.length ? (
                <>
                    {/* <div className="py-10">
            <h2 className="text-xl font-semibold">Looping Positions</h2>
        </div> */}
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
                                <span>Max APY</span>
                            </div>
                            <div className="col-span-1 flex justify-end items-center">
                                <span>LTV</span>
                            </div>
                            <div className="col-span-1 flex justify-end items-center">
                                Actions
                            </div>
                        </div>
                        {/* <div className="h-0 w-full px-5 outline-[10px] outline-gray-600"/> */}
                        <div>
                            {leveragePositions.map((leveragePosition: LeveragePosition, index: number) => (
                                <LeveragePositionCard
                                    key={index}
                                    leveragePosition={leveragePosition}
                                    flashLeverage={flashLeverage}
                                    deleteLeveragePosition={deleteLeveragePosition}
                                />
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <h1 className="text-3xl w-full text-center text-gray-300">No Open Positions</h1>
            )}
        </div>) : (<div className="mt-10">
            <Loader />
        </div>)
    );
};

export default Portfolio;
