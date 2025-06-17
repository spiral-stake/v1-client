import { useEffect, useState } from "react";
import Loader from "../components/low-level/Loader";
import PageTitle from "../components/low-level/PageTitle";
import PositionCard from "../components/low-level/PositionCard";
import { Position, Token } from "../types";
import { useAccount, useChainId } from "wagmi";
import PositionManager from "../contract-hooks/PositionManager";

const Portfolio = ({ positionManager }: { positionManager: PositionManager | undefined }) => {
    const [positions, setPositions] = useState<Position[]>([]);

    const { address } = useAccount();
    const chainId = useChainId();

    useEffect(() => {
        async function getUserPositions() {
            if (!chainId || !address || !positionManager) return;
            setPositions([...await positionManager.getUserPositions(address)]);
        }

        getUserPositions();
    }, [address, positionManager])

    return (
        <div className="pb-16">
            <div className="py-16">
                <PageTitle
                    title={"Your Portfolio"}
                    subheading={`Manage all your borrowing and looping positions in one place`}
                />
            </div>
            {
                (positions.length ? (
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
                ))}
        </div>
    );
}

export default Portfolio;