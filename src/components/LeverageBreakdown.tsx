import BigNumber from "bignumber.js";

const LeverageBreakdown = ({ collateralTokenApy, borrowApy, leverage }: { collateralTokenApy: string, borrowApy: string, leverage: string }) => {


    const tokenApy = BigNumber(collateralTokenApy || 0);
    const _borrowApy = BigNumber(borrowApy || 0);
    const borrowMultiplier = BigNumber(leverage || 1).minus(1);

    const leveragedYield = tokenApy.multipliedBy(leverage);
    const leveragedBorrowCost = _borrowApy.multipliedBy(borrowMultiplier);
    const netApy = leveragedYield.minus(leveragedBorrowCost);


    return (
        <div className="bg-white bg-opacity-[4%] p-6 rounded-2xl w-full text-sm text-white/90 shadow-lg border border-white/10">
            <div className="flex flex-col gap-[8px]">
                <div className="flex flex-col gap-[4px]">
                    <div className="flex justify-between">
                        <span className="text-[14px] font-[400]">Base Yield</span>
                        <span className="text-white font-[500]">{leveragedYield.toFixed(2)}%</span>
                    </div>
                    <div className="text-[12px] text-[#8E8E8E] font-[400]">
                        Token APY  <span className="text-white/80">( {tokenApy.toFixed(2)}% )</span>  x  Leverage <span className="font-medium text-white/80">( {BigNumber(leverage).toFixed(2)} )</span>
                    </div>
                </div>

                <div className="flex flex-col gap-[4px]">
                    <div className="flex justify-between">
                        <span className="text-[14px] font-[400]">Borrow Cost</span>
                        <span className="text-white font-[500]">{leveragedBorrowCost.toFixed(2)}%</span>
                    </div>
                    <div className="text-[12px] text-[#8E8E8E] font-[400]">
                        Borrow APY <span className="text-white/80">( {_borrowApy.toFixed(2)}% )</span>  ×  Borrowed <span className="font-medium text-white/80">( {borrowMultiplier.toFixed(2)} )</span>
                    </div>
                </div>

                <div className="border-t border-white/10 my-3" />

                <div className="flex justify-between text-base">
                    <span className="font-medium text-white/80">Net APY</span>
                    <span className="font-[500] text-white">{netApy.toFixed(2)}%</span>
                </div>
            </div>
        </div>
    );
}



export default LeverageBreakdown;