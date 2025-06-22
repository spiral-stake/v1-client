import BigNumber from "bignumber.js";

const LeverageBreakdown = ({ collateralTokenApy, borrowApy, maxLeverage }: { collateralTokenApy: string, borrowApy: string, maxLeverage: string }) => {


    const tokenApy = BigNumber(collateralTokenApy || 0);
    const _borrowApy = BigNumber(borrowApy || 0);
    const leverage = BigNumber(maxLeverage || 1);
    const borrowMultiplier = leverage.minus(1);

    const leveragedYield = tokenApy.multipliedBy(leverage);
    const leveragedBorrowCost = _borrowApy.multipliedBy(borrowMultiplier);
    const netApy = leveragedYield.minus(leveragedBorrowCost);


    return (
        <div className="bg-[#1A1D2E] p-5 rounded-2xl w-full max-w-sm text-sm text-white/90 shadow-lg border border-white/10">
            <div className="space-y-3">
                <div>
                    <div className="flex justify-between">
                        <span>Base Yield</span>
                        <span className="text-white font-bold">{leveragedYield.toFixed(2)}%</span>
                    </div>
                    <div className="text-xs text-white/50 mt-1">
                        Token APY <span className="font-medium text-white/80">{tokenApy.toFixed(2)}%</span> × Leverage <span className="font-medium text-white/80">{leverage.toFixed(2)}</span>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between">
                        <span>Borrow Cost</span>
                        <span className="text-white font-bold">{leveragedBorrowCost.toFixed(2)}%</span>
                    </div>
                    <div className="text-xs text-white/50 mt-1">
                        Borrow APY <span className="font-medium text-white/80">{_borrowApy.toFixed(2)}%</span> × Borrowed <span className="font-medium text-white/80">{borrowMultiplier.toFixed(2)}</span>
                    </div>
                </div>

                <div className="border-t border-white/10 my-3" />

                <div className="flex justify-between text-base">
                    <span className="font-medium text-white/80">Net APY:</span>
                    <span className="font-bold text-white">{netApy.toFixed(2)}%</span>
                </div>
            </div>
        </div>
    );
}



export default LeverageBreakdown;