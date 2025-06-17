import { useEffect, useRef, useState } from "react";
import ActionBtn from "../components/ActionBtn";
import PageTitle from "../components/low-level/PageTitle";
import { useAccount } from "wagmi";
import SpiralStakeLogo from "../assets/logo.svg";
import { Token } from "../types";
import Input from "../components/low-level/Input";
import PositionManager from "../contract-hooks/PositionManager";
import { displayTokenAmount } from "../utils/displayTokenAmounts";
import BigNumber from "bignumber.js";
import ERC20 from "../contract-hooks/ERC20";
import { calcLtv } from "../utils";
import LTVSlider from "../components/sections/LTVSlider";

const Borrow = ({ positionManager }: { positionManager: PositionManager | undefined }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [collateralToken, setCollateralToken] = useState<Token>();
    const [amountCollateral, setAmountCollateral] = useState("");
    const [amountSpiUsd, setAmountSpiUsd] = useState("");
    const [amountCollateralInUsd, setAmountCollateralInUsd] = useState<BigNumber>(BigNumber(0));
    const [showActions, setShowActions] = useState(false);

    const [actionBtn, setActionBtn] = useState({
        text: "Borrow: Summary",
        onClick: () => { },
        disabled: false,
    });

    const { chainId } = useAccount();
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    useEffect(() => {
        if (!positionManager) return;
        setCollateralToken(positionManager.collateralTokens[0]);

        setActionBtn({
            text: "Borrow",
            onClick: () => setShowActions(true),
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

    const handleCollateralTokenChange = (token: Token) => {
        setCollateralToken(token);
        setAmountCollateral("");
        setIsOpen(false);
    };

    const handleLtvSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
        const ltv = e.target.value;
        const _adjustedSpiUsd = BigNumber(amountCollateralInUsd).multipliedBy(BigNumber(ltv).div(100));
        setAmountSpiUsd(String(_adjustedSpiUsd));
    };

    async function handleApprove(collateralToken: Token) {
        if (!positionManager) return;
        await new ERC20(collateralToken).approve(positionManager.address, amountCollateral);
    }

    async function handleBorrow(collateralToken: Token) {
        if (!positionManager) return;
        await positionManager?.openPosition(collateralToken, amountCollateral, amountSpiUsd);
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

                                    <section className="rounded-sm text-white p-4 sm:p-5 md:p-8 flex flex-1 flex-col gap-4 bg-gradient-to-l from-slate-900 to-gray-950">
                                        <div className="flex items-center justify-between">
                                            <div className="flex h-8 flex-row items-center gap-1">
                                                <h4 className="text-xl font-semibold text-white">Deposit</h4>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="14"
                                                    height="14"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="text-gray-400"
                                                    data-state="closed"
                                                >
                                                    <circle cx="12" cy="12" r="10"></circle>
                                                    <path d="M12 16v-4"></path>
                                                    <path d="M12 8h.01"></path>
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <div data-testid="component-MultiAssetSelector-group">
                                                <div className="flex flex-col gap-2">
                                                    <div className="grid items-center gap-3 p-2 pr-4 rounded-sm border border-[#142435] from-slate-900 to-gray-950 focus-within:border-[#084FAA] grid-cols-[auto_1fr_auto]">
                                                        <div className="min-w-[120px] relative" ref={ref}>
                                                            <button
                                                                type="button"
                                                                onClick={() => setIsOpen(!isOpen)}
                                                                className="group flex w-full gap-2 items-center justify-between rounded-sm border border-[#142435] bg-[#011B37] text-white p-3 hover:border-gray-400 focus-visible:outline-none focus-visible:ring focus-visible:ring-blue-200"
                                                            >
                                                                <div className="flex flex-row items-center gap-2">
                                                                    <svg viewBox="0 0 256 256" className="h-6 w-6">
                                                                        <image
                                                                            x="0"
                                                                            y="0"
                                                                            href="data:image/svg+xml,%3csvg%20width='512'%20height='512'%20viewBox='0%200%20512%20512'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3crect%20width='512'%20height='512'%20rx='256'%20fill='%2300A3FF'/%3e%3cpath%20opacity='.6'%20d='m361.012%20237.812%202.866%204.397c32.326%2049.589%2025.106%20114.533-17.358%20156.139-24.981%2024.478-57.722%2036.718-90.464%2036.721l104.956-197.257Z'%20fill='%23fff'/%3e%3cpath%20opacity='.2'%20d='M256.044%20297.764%20361%20237.812%20256.044%20435.069V297.764Z'%20fill='%23fff'/%3e%3cpath%20d='m150.988%20237.812-2.866%204.397c-32.326%2049.589-25.106%20114.533%2017.358%20156.139%2024.981%2024.478%2057.722%2036.718%2090.464%2036.721L150.988%20237.812Z'%20fill='%23fff'/%3e%3cpath%20opacity='.6'%20d='m255.914%20297.764-104.956-59.952%20104.956%20197.257V297.764Z'%20fill='%23fff'/%3e%3cpath%20opacity='.2'%20d='M256.083%20163.833v103.4l90.408-51.667-90.408-51.733Z'%20fill='%23fff'/%3e%3cpath%20opacity='.6'%20d='m256.056%20163.833-90.473%2051.732%2090.473%2051.668v-103.4Z'%20fill='%23fff'/%3e%3cpath%20d='m256.056%2076.875-90.473%20138.724%2090.473-51.877V76.875Z'%20fill='%23fff'/%3e%3cpath%20opacity='.6'%20d='m256.083%20163.706%2090.477%2051.879-90.477-138.793v86.914Z'%20fill='%23fff'/%3e%3c/svg%3e"
                                                                            width="256"
                                                                            height="256"
                                                                        />
                                                                    </svg>
                                                                    <div className="text-sm font-medium">
                                                                        {collateralToken.symbol}
                                                                    </div>
                                                                </div>
                                                                <svg
                                                                    width="16"
                                                                    height="16"
                                                                    viewBox="0 0 16 16"
                                                                    className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                                                                >
                                                                    <path
                                                                        d="M13 6L8 11L3 6"
                                                                        stroke="#6A7692"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                    />
                                                                </svg>
                                                            </button>

                                                            {isOpen && (
                                                                <div className="absolute top-full left-0 right-0 mt-1 bg-[#011B37] border border-[#142435] rounded-sm shadow-lg z-50">
                                                                    {positionManager.collateralTokens.map((token, index) => (
                                                                        <button
                                                                            key={index}
                                                                            className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#142435] flex items-center gap-2"
                                                                            onClick={() => handleCollateralTokenChange(token)}
                                                                        >
                                                                            <svg viewBox="0 0 256 256" className="h-5 w-5">
                                                                                <image
                                                                                    x="0"
                                                                                    y="0"
                                                                                    href="data:image/svg+xml,%3csvg%20width='512'%20height='512'%20viewBox='0%200%20512%20512'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3crect%20width='512'%20height='512'%20rx='256'%20fill='%2300A3FF'/%3e%3cpath%20opacity='.6'%20d='m361.012%20237.812%202.866%204.397c32.326%2049.589%2025.106%20114.533-17.358%20156.139-24.981%2024.478-57.722%2036.718-90.464%2036.721l104.956-197.257Z'%20fill='%23fff'/%3e%3cpath%20opacity='.2'%20d='M256.044%20297.764%20361%20237.812%20256.044%20435.069V297.764Z'%20fill='%23fff'/%3e%3cpath%20d='m150.988%20237.812-2.866%204.397c-32.326%2049.589-25.106%20114.533%2017.358%20156.139%2024.981%2024.478%2057.722%2036.718%2090.464%2036.721L150.988%20237.812Z'%20fill='%23fff'/%3e%3cpath%20opacity='.6'%20d='m255.914%20297.764-104.956-59.952%20104.956%20197.257V297.764Z'%20fill='%23fff'/%3e%3cpath%20opacity='.2'%20d='M256.083%20163.833v103.4l90.408-51.667-90.408-51.733Z'%20fill='%23fff'/%3e%3cpath%20opacity='.6'%20d='m256.056%20163.833-90.473%2051.732%2090.473%2051.668v-103.4Z'%20fill='%23fff'/%3e%3cpath%20d='m256.056%2076.875-90.473%20138.724%2090.473-51.877V76.875Z'%20fill='%23fff'/%3e%3cpath%20opacity='.6'%20d='m256.083%20163.706%2090.477%2051.879-90.477-138.793v86.914Z'%20fill='%23fff'/%3e%3c/svg%3e"
                                                                                    width="256"
                                                                                    height="256"
                                                                                />
                                                                            </svg>
                                                                            {token.symbol}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex min-w-0 flex-col gap-0.5">
                                                            <Input
                                                                name="amountCollateral"
                                                                placeholder="0"
                                                                onChange={(e: any) => setAmountCollateral(e.target.value)}
                                                                value={amountCollateral}
                                                            />
                                                            <div
                                                                data-testid="component-AssetInput-inputUsdValue"
                                                                className="text-xs truncate text-gray-400"
                                                            >
                                                                ${displayTokenAmount(amountCollateralInUsd, undefined, 2)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>



                                    <section className="rounded-sm p-4 sm:p-5 md:p-8 flex flex-1 flex-col gap-4 bg-gradient-to-r from-slate-900 to-gray-950">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xl font-semibold h-8 text-white">Borrow</h4>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <div className="grid items-center gap-3 p-2 pr-4 rounded-sm border border-[#142435] to-gray-950 focus-within:border-[#084FAA] grid-cols-[auto_1fr]">
                                                <div className="min-w-[120px]">
                                                    <button
                                                        type="button"
                                                        role="combobox"
                                                        aria-controls="radix-:r1l:"
                                                        aria-expanded="false"
                                                        aria-autocomplete="none"
                                                        dir="ltr"
                                                        data-state="closed"
                                                        className="group flex w-full items-center justify-between rounded-sm border border-[#142435] bg-[#011B37] text-white p-3 placeholder:text-gray-400 hover:border-gray-400 hover:shadow-sm disabled:cursor-not-allowed disabled:border-gray-200 disabled:opacity-50 disabled:shadow-sm focus-visible:outline-none focus-visible:ring focus-visible:ring-blue-200 focus-visible:ring-offset-0 data-[state=open]:border-gray-200 data-[state=open]:shadow-sm"
                                                        data-testid="component-AssetSelector-trigger"
                                                    >
                                                        <div className="flex flex-row items-center gap-2">
                                                            <img className="h-6 w-6" src={SpiralStakeLogo} alt="" />
                                                            <div className="text-sm font-medium">SPIUSD</div>
                                                        </div>
                                                    </button>
                                                </div>
                                                <div className="flex min-w-0 flex-col gap-0.5">
                                                    <Input
                                                        name="amountSpiUsd"
                                                        placeholder="0"
                                                        onChange={(e: any) => setAmountSpiUsd(e.target.value)}
                                                        value={amountSpiUsd}
                                                    />
                                                    <div
                                                        data-testid="component-AssetInput-inputUsdValue"
                                                        className="text-xs truncate text-gray-400"
                                                    >
                                                        ${amountSpiUsd || "0"}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                </div>

                                <LTVSlider
                                    positionManager={positionManager}
                                    ltv={calcLtv(BigNumber(amountSpiUsd), amountCollateralInUsd)}
                                    handleLtvSlider={handleLtvSlider}
                                />
                            </div>
                        </section>
                        <div className="px-7">
                            <ActionBtn
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
                            <section className="rounded-sm bg-gradient-to-b from-slate-900 to-gray-950 text-white p-4 sm:p-5 md:p-8 flex flex-col justify-end gap-3 col-span-2">
                                <h4 className="text-lg font-semibold">Borrow Rate</h4>
                                <div className="flex flex-col gap-3">
                                    <h3
                                        className="text-4xl font-bold bg-gradient-to-r from-orange-100 to-orange-600 bg-clip-text text-transparent"
                                        data-testid="easyBorrow-form-borrowRate"
                                    >
                                        5.02%
                                    </h3>
                                    <div className="text-sm text-gray-300">
                                        Borrow SPIUSD directly from your Staked Stablecoins
                                    </div>
                                </div>
                            </section>

                            {/* Actions */}
                            {showActions && (
                                <section className="rounded-sm text-white pt-7">
                                    <section className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xl font-semibold text-white">Actions</h3>
                                        </div>
                                        <div className="rounded-sm border border-[#142435]">
                                            <div className="grid grid-cols-[auto_1fr_auto] gap-x-3 sm:gap-x-8 md:grid-cols-[auto_auto_auto_1fr_auto]">
                                                <div
                                                    className="col-span-full grid grid-cols-subgrid items-center gap-y-3 border-b border-[#142435] p-4 last:border-none sm:p-5"
                                                    data-testid="actions-row-2"
                                                >
                                                    <div
                                                        className="overflow-x-auto overflow-y-hidden whitespace-nowrap text-xs font-medium col-span-2 flex items-center gap-1.5 sm:overflow-visible md:col-span-1"
                                                        data-chromatic="ignore"
                                                    >
                                                        Approve
                                                    </div>
                                                    <div className="text-xs font-medium col-span-full col-start-2 md:col-span-3">
                                                        {amountCollateral}{" "}
                                                        <span className="text-gray-400">{collateralToken.symbol}</span>
                                                    </div>
                                                    <div>
                                                        <ActionBtn
                                                            text={"Approve"}
                                                            disabled={false}
                                                            expectedChainId={Number(chainId)}
                                                            onClick={() => handleApprove(collateralToken)}
                                                        />
                                                    </div>
                                                </div>

                                                <div
                                                    className="col-span-full grid grid-cols-5 items-center gap-y-3 border-b border-[#142435] p-4 last:border-none sm:p-5"
                                                    data-testid="actions-row-2"
                                                >
                                                    <div
                                                        className="overflow-x-auto overflow-y-hidden whitespace-nowrap text-xs font-medium col-span-1 flex items-center gap-1.5 sm:overflow-visible md:col-span-1"
                                                        data-chromatic="ignore"
                                                    >
                                                        Borrow
                                                    </div>
                                                    <div className="text-xs font-medium col-span-1 col-start-2 md:col-span-3">
                                                        {amountSpiUsd} <span className="text-gray-400">SPIUSD</span>
                                                    </div>
                                                    <div>
                                                        <ActionBtn
                                                            text={"Borrow"}
                                                            disabled={false}
                                                            expectedChainId={Number(chainId)}
                                                            onClick={() => handleBorrow(collateralToken)}
                                                        />
                                                    </div>
                                                </div>
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
