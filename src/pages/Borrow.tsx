import { useEffect, useState } from "react";
import ActionBtn from "../components/ActionBtn";
import PageTitle from "../components/low-level/PageTitle";
import { useAccount } from "wagmi";
import { Token } from "../types";
import PositionManager from "../contract-hooks/PositionManager";
import BigNumber from "bignumber.js";
import ERC20 from "../contract-hooks/ERC20";
import { calcLtv } from "../utils";
import LTVSlider from "../components/LTVSlider";
import TokenAmount from "../components/TokenAmount";
import APYInfo from "../components/sections/InfoSection";
import Action from "../components/Action";

const Borrow = ({ positionManager }: { positionManager: PositionManager }) => {
    const [collateralToken, setCollateralToken] = useState<Token>();
    const [amountCollateral, setAmountCollateral] = useState("");
    const [amountSpiUsd, setAmountSpiUsd] = useState("");
    const [amountCollateralInUsd, setAmountCollateralInUsd] = useState<BigNumber>(BigNumber(0));
    const [showSummary, setShowSummary] = useState(false);

    const [actionBtn, setActionBtn] = useState({
        text: "Borrow: Summary",
        onClick: () => { },
        disabled: false,
    });

    const [userCollateralBalance, setUserCollateralBalance] = useState<BigNumber>();
    const [userCollateralAllowance, setUserCollateralAllowance] = useState<BigNumber>();

    const { chainId, address } = useAccount();

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
        const allowance = await new ERC20(collateralToken).allowance(address, positionManager.address);
        setUserCollateralAllowance(allowance);
    };

    // For Summary
    useEffect(() => {
        if (!positionManager) return;
        setCollateralToken(positionManager.collateralTokens[0]);

        setActionBtn({
            text: "Borrow: Summary",
            onClick: () => setShowSummary(true),
            disabled: false,
        });
    }, [positionManager]);

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

    const handleLtvSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
        const ltv = e.target.value;
        const _adjustedSpiUsd = BigNumber(amountCollateralInUsd).multipliedBy(BigNumber(ltv).div(100));
        setAmountSpiUsd(String(_adjustedSpiUsd));
    };

    async function handleApprove() {
        if (!positionManager || !collateralToken) return;
        await new ERC20(collateralToken).approve(positionManager.address, amountCollateral);
        setUserCollateralAllowance(BigNumber(amountCollateral));
    }

    async function handleBorrow() {
        if (!positionManager || !collateralToken) return;
        await positionManager?.openPosition(collateralToken, amountCollateral, amountSpiUsd);
        updateUserCollateralBalance();
    }

    return (
        positionManager &&
        collateralToken && (
            <div className="pb-16">
                <div className="py-16">
                    <PageTitle
                        title={"Easy Borrow"}
                        subheading={`Free up liquidity locked in staked stablecoins without foregoing their Yield & protocol points`}
                    />
                </div>
                <div className="xl:grid xl:grid-cols-[67%_calc(33%-18px)] xl:gap-[18px]">
                    <form onSubmit={(e) => e.preventDefault()} className="flex flex-1 flex-col gap-4">
                        {/* MINT SECTION */}
                        <section className="rounded-sm flex flex-col gap-3 p-1.5 bg-gradient-to-b from-slate-900 to-gray-950">
                            <div className="flex flex-col gap-3">
                                <div className="relative grid grid-cols-1 md:grid-cols-2">
                                    <TokenAmount
                                        title="Deposit"
                                        titleHoverInfo="Deposit Collateral"
                                        tokens={positionManager.collateralTokens}
                                        selectedToken={collateralToken}
                                        handleTokenChange={setCollateralToken}
                                        amount={amountCollateral}
                                        handleAmountChange={setAmountCollateral}
                                        amountInUsd={amountCollateralInUsd}
                                        bgStyle={"bg-gradient-to-l from-slate-900 to-gray-950"}
                                    />

                                    <TokenAmount
                                        title="Borrow"
                                        selectedToken={positionManager.spiUsd}
                                        amount={amountSpiUsd}
                                        handleAmountChange={setAmountSpiUsd}
                                        amountInUsd={BigNumber(amountSpiUsd || "0.00")}
                                        bgStyle={"bg-gradient-to-r from-slate-900 to-gray-950"}
                                    />
                                </div>

                                <LTVSlider
                                    maxLtv={positionManager.maxLtv}
                                    ltv={calcLtv(BigNumber(amountSpiUsd), amountCollateralInUsd)}
                                    handleLtvSlider={handleLtvSlider}
                                />
                            </div>
                        </section>
                        <div className="px-7">
                            <ActionBtn
                                btnLoading={false}
                                text={actionBtn.text}
                                disabled={actionBtn.disabled}
                                expectedChainId={Number(chainId)}
                                onClick={actionBtn.onClick}
                            />
                        </div>
                    </form>

                    {/* INFO SECTION */}
                    <div className="sticky top-2 hidden h-fit xl:block">
                        <section className="rounded-sm p-0 grid h-fit grid-cols-1 sm:grid-cols-[3fr_2fr] xl:grid-cols-1">
                            <APYInfo
                                title="Fixed Borrow Rate"
                                apy={positionManager.borrowApy}
                                description="Borrow SPIUSD directly from your PT's or Staked Stablecoins"
                            />

                            {/* Actions */}
                            {showSummary && (
                                <section className="rounded-sm text-white pt-7">
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
                                                    text="Borrow"
                                                    token={positionManager.spiUsd}
                                                    amountToken={amountSpiUsd}
                                                    actionHandler={handleBorrow}
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

export default Borrow;
