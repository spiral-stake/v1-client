import { useEffect, useState } from "react";
import FlashLeverage from "../contract-hooks/FlashLeverage";
import { LeveragePosition } from "../types";
import LeveragePositionCard from "./LeveragePositionCard";
import { useChainId } from "wagmi";

const LegacyPositions = ({ address }: { address: string }) => {
  const [flashLeverage, setFlashLeverage] = useState<FlashLeverage>();
  const [leveragePositions, setLeveragePositions] = useState<
    LeveragePosition[]
  >([]);

  const appChainId = useChainId();

  useEffect(() => {
    /**
     * @dev on appChainId change, reset the collateralTokens and positionManager according to the chain
     */
    async function handleChainChange() {
      const [_flashLeverage] = await Promise.all([
        FlashLeverage.createInstance(appChainId, true),
      ]);
      setFlashLeverage(_flashLeverage);
    }



    handleChainChange();
  }, [appChainId]);

  useEffect(() => {
    async function getUserPositions() {
      if (flashLeverage) {
        setLeveragePositions([
          ...(await flashLeverage.getUserLeveragePositions(address)),
        ]);
      }
    }

    getUserPositions();
  }, [flashLeverage]);

  function deleteLeveragePosition(positionId: number) {
    setLeveragePositions((prev) =>
      prev.filter((position) => position.id !== positionId)
    );
  }



  return flashLeverage && leveragePositions?.length ? (
    <div>
      <div className="grid lg:grid-cols-2 items-center pb-4">
        <div className="text-xl font-['Outfit'] font-normal text-[#B6B6B6] p-2">Previous Positions</div>
        <div className="flex items-start p-4 gap-3 rounded-[12px] border border-yellow-500/40 bg-yellow-500/10 text-yellow-200 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5 mt-0.5 flex-shrink-0 text-yellow-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>
            <span className="font-semibold">Warning:</span> This position was opened on an earlier version of our leverage contracts.
            We’ve introduced an updated <span className="font-medium">SwapRouter</span> to improve position management at maturity.
            For a smooth experience, please unleverage and re-leverage as early as possible.
          </p>
        </div>

      </div>
      <div className="bg-white bg-opacity-[4%] rounded-xl p-[12px]">
        <div className="hidden py-5 w-full lg:grid grid-cols-12 px-5 border-b-[1px] border-white border-opacity-[10%]">
          <div className="col-span-1 flex px-3 justify-start items-center">
            <span>#</span>
          </div>
          <div className="col-span-2 flex justify-start items-center">
            <span className="w-full inline-flex justify-start items-center gap-4">SLYs</span>
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
    </div>
  ) : null;
};

export default LegacyPositions;
