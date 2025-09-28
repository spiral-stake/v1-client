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
    if (!flashLeverage)
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

  return flashLeverage && (
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
  );
};

export default LegacyPositions;
