import { useEffect, useState } from "react";
import Loader from "../components/low-level/Loader";
import PageTitle from "../components/low-level/PageTitle";
import { LeveragePosition, Position } from "../types";
import { useAccount, useChainId } from "wagmi";
import FlashLeverage from "../contract-hooks/FlashLeverage";
import LeveragePositionCard from "../components/LeveragePositionCard";
import portfolioChart from "../assets/portfolioChart.svg";

const Portfolio = ({ flashLeverage }: { flashLeverage: FlashLeverage }) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [leveragePositions, setLeveragePositions] = useState<
    LeveragePosition[]
  >([]);
  const [showLoader, setShowLoader] = useState(true);

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
          <div>
            <img src={portfolioChart} alt="" className="w-full"/>
          </div>

          {/* mobile */}
          <div className="bg-white bg-opacity-[4%] rounded-xl p-[12px]">
            <div className="hidden py-5 w-full lg:grid grid-cols-12 px-5 border-b-[1px] border-white border-opacity-[10%]">
              <div className="col-span-1 flex px-3 justify-start items-center">
                <span>#</span>
              </div>
              <div className="col-span-2 flex justify-start items-center">
                <span className="w-full inline-flex justify-start items-center gap-4">
                  SLYs
                </span>
              </div>

              <div className="col-span-1 flex justify-start items-center">
                <span>Leverage</span>
              </div>
              <div className="col-span-2 flex justify-start px-4 items-center">
                <span>LTV</span>
              </div>
              <div className="col-span-2 flex justify-start items-center">
                <span>Leveraged(APY)</span>
              </div>
              <div className="col-span-2 flex justify-start items-center">
                <span>My position</span>
              </div>
              <div className="col-span-2 flex justify-start items-center"></div>
            </div>
            {/* <div className="h-0 w-full px-5 outline-[10px] outline-gray-600"/> */}
            <div className="">
              {leveragePositions.map(
                (leveragePosition: LeveragePosition, index: number) => (
                  <LeveragePositionCard
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
