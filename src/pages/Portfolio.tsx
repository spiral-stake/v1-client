import { useEffect, useState } from "react";
import Loader from "../components/low-level/Loader";
import PageTitle from "../components/low-level/PageTitle";
import { LeveragePosition, Position } from "../types";
import { useAccount, useChainId } from "wagmi";
import FlashLeverage from "../contract-hooks/FlashLeverage";
import LeveragePositionCard from "../components/LeveragePositionCard";
import portfolioChart from "../assets/portfolioChart2.svg";
import NewLeveragePositionCard from "../components/new-components/newLeveragePositionCard";

const Portfolio = ({ flashLeverage }: { flashLeverage: FlashLeverage }) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [leveragePositions, setLeveragePositions] = useState<
    LeveragePosition[]
  >([]);
  const [showLoader, setShowLoader] = useState(true);

  const { address } = useAccount();
  const chainId = useChainId();

  const sum = leveragePositions.reduce(
    (total, current) =>
      total +
      Number(
        current.amountCollateral.multipliedBy(
          current.collateralToken.valueInUsd
        )
      ),
    0
  );

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
    setLeveragePositions((prev) =>
      prev.filter((position) => position.id !== positionId)
    );
  }

  return flashLeverage ? (
    <div className="pb-16 flex flex-col gap-[48px] py-[48px]">
      <div className="">
        <PageTitle
          title={"Portfolio"}
          subheading={`Track and manage all your yield positions in one place.`}
        />
      </div>
      {showLoader ? (
        <Loader />
      ) : leveragePositions.length ? (
        <>
          {/* chart */}
          <div className="w-full flex p-[24px] gap-[100px] bg-white bg-opacity-[4%] rounded-[20px] border-[1px] border-white border-opacity-[6%]">
            <div className="flex flex-col">
              <p className="text-[14px] text-[#B6B6B6]">My positions</p>
              <p className="text-[24px] font-[500] text-[#E4E4E4]">
                ${sum.toFixed(2)}
              </p>
            </div>
            <div className="flex flex-col">
              <p className="text-[14px] text-[#B6B6B6]">Total positions</p>
              <p className="text-center text-[24px] font-[500] text-[#E4E4E4]">
                {leveragePositions.length}
              </p>
            </div>
          </div>

          {/* mobile */}
          <div className="">
            
            <div className="flex flex-col gap-[24px]">
              {leveragePositions.map(
                (leveragePosition: LeveragePosition, index: number) => (
                  <NewLeveragePositionCard
                    key={index}
                    leveragePosition={leveragePosition}
                    flashLeverage={flashLeverage}
                    deleteLeveragePosition={deleteLeveragePosition}
                  />
                )
              )}
            </div>
          </div>
        </>
      ) : (
        <h1 className="text-3xl w-full text-center text-gray-300">
          No Open Positions
        </h1>
      )}
    </div>
  ) : (
    <div className="mt-10">
      <Loader />
    </div>
  );
};

export default Portfolio;
