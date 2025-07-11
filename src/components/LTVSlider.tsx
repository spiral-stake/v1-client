import BigNumber from "bignumber.js";
import PositionManager from "../../contract-hooks/PositionManager";
import { HoverInfo } from "./low-level/HoverInfo";

const LTVSlider = ({
  maxLtv,
  ltv,
  handleLtvSlider,
}: {
  maxLtv: string;
  ltv: string;
  handleLtvSlider: (e: any) => void;
}) => {
  return (
    <section className="rounded-sm text-white p-4 sm:p-5 md:p-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <div className="text-xl font-semibold items-center flex justify-between">
            <div className="flex flex-row items-center gap-2">
                <h4 className="hidden lg:inline-block">Safe Loan to Value (LTV)</h4>
                <h4 className="lg:hidden">Safe LTV</h4>
            <HoverInfo content="Ratio of the collateral value to the borrowed value" />
            </div>
            <h4>~{ltv || "0.00"}%</h4>
          </div>
          <div className="text-sm mt-2 flex justify-start lg:justify-end text-gray-400">
            {/* <div>Ratio of the collateral value to the borrowed value</div> */}
            <div className="text-right flex flex-col">
              {/* <span>max. <span className="text-gray-300">{maxLtv}%</span></span> */}
              <span>
                liquidation.{" "}
                <span className="text-gray-300">
                  {BigNumber(ltv).plus(5).toFixed(2)}%
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Slider */}
        {/* <div className="px-2.5">
                <input
                    type="range"
                    min="0"
                    max={maxLtv}
                    step="0.01"
                    value={ltv || "0.00"}
                    onChange={handleLtvSlider}
                    className="w-full"
                />
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                    <span>Conservative</span>
                    <span className="text-white">Moderate</span>
                    <span className="text-red-500">Aggressive</span>
                </div>
            </div> */}
      </div>
    </section>
  );
};

export default LTVSlider;
