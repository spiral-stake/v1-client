import { useEffect, useState } from "react";
import Loader from "../components/low-level/Loader";
import PageTitle from "../components/low-level/PageTitle";
import { LeveragePosition } from "../types";
import { useAccount, useChainId } from "wagmi";
import FlashLeverage from "../contract-hooks/FlashLeverage";
import LeveragePositionCard from "../components/LeveragePositionCard.tsx";
import axios from "axios";
import { updatePositionsData } from "../utils/updatePositionsData.ts";

const Portfolio = ({ flashLeverage }: { flashLeverage: FlashLeverage }) => {
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

      const baseUrl =
        chainId !== 31337
          ? "https://api.spiralstake.xyz"
          : "http://localhost:5000";

      if (flashLeverage) {
        let [_leveragePositions, allLeveragePositions] = await Promise.all([
          flashLeverage.getUserLeveragePositions(address),
          axios
            .get<any[]>(`${baseUrl}/leveragePositions`)
            .then((res) => res.data),
        ]);

        _leveragePositions = updatePositionsData(
          allLeveragePositions,
          address,
          _leveragePositions
        );
        setLeveragePositions(_leveragePositions);
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
              <p className="text-[14px] text-[#B6B6B6]">
                Total Amount Deposited
              </p>
              <p className="text-[24px] font-[500] text-[#E4E4E4]">
                $
                {leveragePositions
                  .reduce(
                    (total, current) =>
                      current.open
                        ? total + Number(current.amountDepositedInUsd)
                        : total,
                    0
                  )
                  .toFixed(2)}
              </p>
            </div>
            {/* <div className="flex flex-col">
              <p className="text-[14px] text-[#B6B6B6]">Total Position Value</p>
              <p className="text-[24px] font-[500] text-[#E4E4E4]">
                ${leveragePositions.reduce((total, current) =>
                  current.open
                    ? total + Number(current.positionValueInUsd)
                    : total,
                  0
                ).toFixed(2)}
              </p>
            </div>
            <div className="flex flex-col">
              <p className="text-[14px] text-[#B6B6B6]">Total Yield Generated</p>
              <p className="text-[24px] font-[500] text-[#E4E4E4]">
                ${leveragePositions.reduce((total, current) =>
                  current.open
                    ? total + Number(current.yieldGenerated)
                    : total,
                  0
                ).toFixed(2)}
              </p>
            </div> */}

            <div className="flex flex-col">
              <p className="text-[14px] text-[#B6B6B6]">Open positions</p>
              <p className="text-center text-[24px] font-[500] text-[#E4E4E4]">
                {leveragePositions.reduce(
                  (count, pos) => (pos.open ? count + 1 : count),
                  0
                )}
              </p>
            </div>
          </div>

          {/* mobile */}
          <div className="flex flex-col gap-[24px] lg:hidden">
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

          {/* desktop */}
          <div className="lg:flex flex-col gap-[14px] hidden">
            {leveragePositions
              .sort((a, b) => Number(b.open) - Number(a.open))
              .map((leveragePosition: LeveragePosition, index: number) => (
                <LeveragePositionCard
                  key={index}
                  leveragePosition={leveragePosition}
                  flashLeverage={flashLeverage}
                  deleteLeveragePosition={deleteLeveragePosition}
                />
              ))}
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
