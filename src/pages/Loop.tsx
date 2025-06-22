import { useEffect, useState } from "react";
import PageTitle from "../components/low-level/PageTitle";
import LTVSlider from "../components/LTVSlider";
import PositionManager from "../contract-hooks/PositionManager";
import BigNumber from "bignumber.js";
import { Token } from "../types";
import { useAccount } from "wagmi";
import { calcLeverageApy, calcMaxLeverage } from "../utils";
import ActionBtn from "../components/ActionBtn";
import ERC20 from "../contract-hooks/ERC20";
import FlashLeverage from "../contract-hooks/FlashLeverage";
import TokenAmount from "../components/TokenAmount";
import APYInfo from "../components/sections/InfoSection";
import LeverageBreakdown from "../components/LeverageBreakdown";
import Action from "../components/Action";

const Loop = ({
    positionManager,
    flashLeverage,
}: {
    positionManager: PositionManager;
    flashLeverage: FlashLeverage;
}) => {
    const [collateralToken, setCollateralToken] = useState<Token>();
    const [amountCollateral, setAmountCollateral] = useState("");
    const [amountCollateralInUsd, setAmountCollateralInUsd] = useState<BigNumber>(BigNumber(0));
    const [desiredLtv, setLtv] = useState("75");
    const [maxLeverage, setMaxLeverage] = useState("");
    const [showActions, setShowActions] = useState(false);
    const [actionBtn, setActionBtn] = useState({
        text: "Borrow: Summary",
        onClick: () => { },
        disabled: false,
    });

    const [userCollateralBalance, setUserCollateralBalance] = useState<BigNumber>();
    const [userCollateralAllowance, setUserCollateralAllowance] = useState<BigNumber>();

    const { chainId, address } = useAccount();

    useEffect(() => {
        if (!positionManager || !flashLeverage) return;
        setCollateralToken(flashLeverage.collateralTokens[0]);

        setActionBtn({
            text: "Loop",
            onClick: () => setShowActions(true),
            disabled: false,
        });
    }, [positionManager, flashLeverage]);

    useEffect(() => {
        async function updateCollateralValueInUsd() {
            if (positionManager && collateralToken && amountCollateral) {
                setAmountCollateralInUsd(
                    await positionManager.getTokenUsdValue(collateralToken, amountCollateral)
                );
            } else {
                setAmountCollateralInUsd(BigNumber(0));
            }
        }

        updateCollateralValueInUsd();
    }, [positionManager, collateralToken, amountCollateral]);

    useEffect(() => {
        setMaxLeverage(calcMaxLeverage(desiredLtv));
    }, [desiredLtv]);

    useEffect(() => {
        updateUserCollateralBalance();
        updateUserCollateralAllowance();
    }, [address, collateralToken]);

    const updateUserCollateralBalance = async () => {
        if (!address || !collateralToken) return;
        const balance = await new ERC20(collateralToken).balanceOf(address);
        setUserCollateralBalance(balance);
    };

    const updateUserCollateralAllowance = async () => {
        if (!address || !collateralToken) return;
        const allowance = await new ERC20(collateralToken).allowance(address, flashLeverage.address);
        setUserCollateralAllowance(allowance);
    };

    const handleCollateralTokenChange = (token: Token) => {
        setCollateralToken(token);
        setAmountCollateral("");
    };

    const handleLtvSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLtv(BigNumber(e.target.value).toFixed(2));
    };

    async function handleApprove() {
        if (!flashLeverage || !collateralToken) return;
        await new ERC20(collateralToken).approve(flashLeverage.address, amountCollateral);
        setUserCollateralAllowance(BigNumber(amountCollateral));
    }

    async function handleLeverage() {
        if (!flashLeverage || !collateralToken) return;
        await flashLeverage.leverage(collateralToken, amountCollateral, desiredLtv);
    }

    return (
        flashLeverage &&
        collateralToken && (
            <div className="pb-16">
                <div className="py-16">
                    <PageTitle
                        title={"Auto Loop"}
                        subheading={`Seamlessly Leverage in one click, with our cost-efficient Auto-looping powered by SPIUSD's Flashmint`}
                    />
                </div>{" "}
                <div className="xl:grid xl:grid-cols-[67%_calc(33%-18px)] xl:gap-[18px]">
                    <form onSubmit={(e) => e.preventDefault()} className="flex flex-1 flex-col gap-4">
                        <section className="rounded-sm flex flex-col gap-3 p-1.5 bg-gradient-to-b from-slate-900 to-gray-950">
                            <div className="flex flex-col gap-3">
                                <div className="relative grid grid-cols-1 md:grid-cols-2">
                                    <TokenAmount
                                        title="Loop"
                                        titleHoverInfo="Loop your assets to enjoy fixed leveraged yield"
                                        tokens={positionManager.collateralTokens}
                                        selectedToken={collateralToken}
                                        handleTokenChange={handleCollateralTokenChange}
                                        amount={amountCollateral}
                                        handleAmountChange={setAmountCollateral}
                                        amountInUsd={amountCollateralInUsd}
                                        bgStyle={"bg-slate-950"}
                                    />

                                    <section className="rounded-sm p-4 sm:p-5 md:p-8 flex flex-1 justify-center items-center flex-col gap-4 bg-gradient-to-l from-slate-950 via-gray-900 to-slate-950">
                                        <div className="text-4xl font-semibold">{maxLeverage}x Leverage</div>
                                    </section>
                                </div>

                                <LTVSlider
                                    maxLtv={flashLeverage?.maxLeverageLtv}
                                    ltv={desiredLtv}
                                    handleLtvSlider={handleLtvSlider}
                                />
                            </div>

                            <div className="px-7">
                                <ActionBtn
                                    btnLoading={false}
                                    text={actionBtn.text}
                                    disabled={actionBtn.disabled}
                                    expectedChainId={Number(chainId)}
                                    onClick={actionBtn.onClick}
                                />
                            </div>
                        </section>
                    </form>

                    {/* INFO SECTION */}
                    <div className="sticky top-2 hidden h-fit xl:block">
                        <section className="rounded-sm p-0 grid h-fit grid-cols-1 sm:grid-cols-[3fr_2fr] xl:grid-cols-1">
                            <APYInfo
                                title={collateralToken.isPT ? "Fixed Leveraged APY" : "Max Leveraged APY"}
                                description="Loop your staked stable's for fixed leveraged yield"
                                apy={`${!collateralToken.isPT ? "~" : ""} ${calcLeverageApy(
                                    collateralToken.apy,
                                    positionManager.borrowApy,
                                    desiredLtv
                                )}`}
                                apyBreakdown={
                                    <LeverageBreakdown
                                        collateralTokenApy={collateralToken.apy}
                                        borrowApy={positionManager.borrowApy}
                                        maxLeverage={maxLeverage}
                                    />
                                }
                            />

                            {/* Actions */}
                            {showActions && (
                                <section className="rounded-sm text-white">
                                    <section className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xl font-semibold text-white">Actions</h3>
                                        </div>
                                        <div className="rounded-sm border border-[#142435]">
                                            <div className="grid grid-cols-[auto_1fr_auto] gap-x-3 sm:gap-x-8 md:grid-cols-[auto_auto_auto_1fr_auto]">
                                                <Action
                                                    text="Approve"
                                                    token={collateralToken}
                                                    amountToken={amountCollateral}
                                                    actionHandler={handleApprove}
                                                    completed={userCollateralAllowance?.gte(BigNumber(amountCollateral))}
                                                />
                                                <Action
                                                    text="Loop"
                                                    token={collateralToken}
                                                    amountToken={amountCollateral}
                                                    actionHandler={handleLeverage}
                                                />
                                            </div>
                                        </div>
                                    </section>
                                </section>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        )
    );
};

export default Loop;
