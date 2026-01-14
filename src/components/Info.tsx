import { useState } from "react";
import FlashLeverage from "../contract-hooks/FlashLeverage";
import Input from "./low-level/Input";
import ActionBtn from "./ActionBtn";
import { useChainId } from "wagmi";
import { handleAsync } from "../utils/handleAsyncFunction";
import { LeveragePosition } from "../types";
import Morpho from "../contract-hooks/Morpho";
import ERC20 from "../contract-hooks/ERC20";
import { parseUnits } from "../utils/formatUnits";
import BigNumber from "bignumber.js";
import UserProxy from "../contract-hooks/UserProxy";

const Info = ({ flashLeverage, pos }: { flashLeverage: FlashLeverage, pos: LeveragePosition }) => {
    const [amountRepay, setAmountRepay] = useState("");
    const [amountCollateral, setAmountCollateral] = useState("");
    const [repayLoading, setRepayLoading] = useState(false);
    const [withdrawLoading, setWithdrawLoading] = useState(false);

    const chainId = useChainId();

    const handleRepay = async () => {
        const morpho = new Morpho();

        await new ERC20(pos.collateralToken.loanToken).approve(morpho.address, amountRepay);
        await morpho.repay(pos, amountRepay);
    }

    const handleWithdraw = async () => {
        await new UserProxy(pos.userProxy).execute(new Morpho().withdrawCollateralEncodedData(pos, amountCollateral))
    }

    return (
        <div className="flex justify-between">
            <div>
                <section
                    className={`w-full text-white lg:p-0 sm:p-5 flex flex-1 flex-col gap-4`}
                >
                    {/* input area box   */}
                    <div className="flex flex-col border-[1px] border-white border-opacity-[14%] bg-white bg-opacity-[4%] p-[16px] rounded-[20px]">
                        <div className="flex items-center justify-between">
                            <Input
                                type="number"
                                name="amountRepay"
                                placeholder="0"
                                onChange={(e: any) => setAmountRepay(e.target.value)}
                                value={amountRepay}
                            />
                            <div className="relative transition-all duration-300" >
                                <div

                                    className={`cursor-pointer flex w-full h-[45px] gap-[8px] items-center
                                         rounded-[12px] p-[11px] border-[1px] border-[white] border-opacity-[10%] text-white`}
                                >
                                    {/* Need to add Symbol */}
                                    <div className="flex items-center gap-[6px] w-[100px]">
                                        <img
                                            src={`/tokens/${flashLeverage.usdc.symbol}.svg`}
                                            alt=""
                                            className="w-[20px]"
                                        />
                                        <p className="truncate text-[16px] font-normal">
                                            {flashLeverage.usdc.symbol}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <ActionBtn
                        btnLoading={repayLoading}
                        text="Repay"
                        onClick={handleAsync(handleRepay, setRepayLoading)}
                        expectedChainId={Number(chainId)}
                    />
                </section>
            </div>
            <div>

                <section
                    className={`w-full text-white lg:p-0 sm:p-5 flex flex-1 flex-col gap-4`}
                >
                    {/* input area box   */}
                    <div className="flex flex-col border-[1px] border-white border-opacity-[14%] bg-white bg-opacity-[4%] p-[16px] rounded-[20px]">
                        <div className="flex items-center justify-between">
                            <Input
                                type="number"
                                name="amountCollateral"
                                placeholder="0"
                                onChange={(e: any) => setAmountCollateral(e.target.value)}
                                value={amountCollateral}
                            />
                            <div className="relative transition-all duration-300" >
                                <div

                                    className={`cursor-pointer flex w-full h-[45px] gap-[8px] items-center
                                         rounded-[12px] p-[11px] border-[1px] border-[white] border-opacity-[10%] text-white`}
                                >
                                    {/* Need to add Symbol */}
                                    <div className="flex items-center gap-[6px] w-[100px]">
                                        <img
                                            src={`/tokens/${pos.collateralToken.symbolExtended}.svg`}
                                            alt=""
                                            className="w-[20px]"
                                        />
                                        <p className="truncate text-[16px] font-normal">
                                            {pos.collateralToken.symbol}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <ActionBtn
                        btnLoading={withdrawLoading}
                        text="Withdraw Collateral"
                        onClick={handleAsync(handleWithdraw, setWithdrawLoading)}
                        expectedChainId={Number(chainId)}
                    />
                </section>
            </div>
        </div>
    );
}

export default Info;