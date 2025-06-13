import { useEffect, useRef, useState } from "react";
import ActionBtn from "../components/ActionBtn";
import PageTitle from "../components/low-level/PageTitle";
import { useAccount } from "wagmi";
import SpiralStakeLogo from "../assets/logo.svg"
import { Token } from "../types";
import Input from "../components/low-level/Input";

const Borrow = ({ collateralTokens }: { collateralTokens: Token[] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [collateralToken, setCollateralToken] = useState<Token>()
    const [inputValue, setInputValue] = useState<{
        amountSpiUsd: String,
        amountCollateral: String
    }>()

    const [actionBtn, setActionBtn] = useState({
        text: "Borrow",
        onClick: () => { },
        disabled: false,
    });

    const { chainId } = useAccount();
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!collateralTokens.length) return;
        setCollateralToken(collateralTokens[0])
    }, [collateralTokens]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setInputValue((prevInput: any) => ({
            ...prevInput,
            [name]: value,
        }));
    };

    const handleCollateralTokenChange = (token: Token) => {
        setCollateralToken(token);
        setIsOpen(false);
    }


    return collateralTokens.length && collateralToken && (
        <div className="pb-16">
            <div className="py-16">
                <PageTitle
                    title={"Easy Borrow"}
                    subheading={`Free up liquidity locked in staked stablecoins without foregoing Yield & protocol points`}
                />
            </div>
            <div className="xl:grid xl:grid-cols-[67%_calc(33%-18px)] xl:gap-[18px]">
                <form onSubmit={(e) => e.preventDefault()} className="flex flex-1 flex-col gap-4">
                    {/* MINT SECTION */}
                    <section className="rounded-sm flex flex-col gap-3 p-1.5 bg-gradient-to-b from-slate-900 to-gray-950">
                        <div className="flex flex-col gap-3">
                            <div className="relative grid grid-cols-1 md:grid-cols-2">
                                <section className="rounded-sm  p-0 flex flex-col" data-testid="easyBorrow-form-deposits">
                                    <section className="rounded-sm text-white p-4 sm:p-5 md:p-8 flex flex-1 flex-col gap-4 bg-gradient-to-l from-slate-900 to-gray-950">
                                        <div className="flex items-center justify-between">
                                            <div className="flex h-8 flex-row items-center gap-1">
                                                <h4 className="text-xl font-semibold text-white">Deposit</h4>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400" data-state="closed">
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
                                                                        <image x="0" y="0" href="data:image/svg+xml,%3csvg%20width='512'%20height='512'%20viewBox='0%200%20512%20512'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3crect%20width='512'%20height='512'%20rx='256'%20fill='%2300A3FF'/%3e%3cpath%20opacity='.6'%20d='m361.012%20237.812%202.866%204.397c32.326%2049.589%2025.106%20114.533-17.358%20156.139-24.981%2024.478-57.722%2036.718-90.464%2036.721l104.956-197.257Z'%20fill='%23fff'/%3e%3cpath%20opacity='.2'%20d='M256.044%20297.764%20361%20237.812%20256.044%20435.069V297.764Z'%20fill='%23fff'/%3e%3cpath%20d='m150.988%20237.812-2.866%204.397c-32.326%2049.589-25.106%20114.533%2017.358%20156.139%2024.981%2024.478%2057.722%2036.718%2090.464%2036.721L150.988%20237.812Z'%20fill='%23fff'/%3e%3cpath%20opacity='.6'%20d='m255.914%20297.764-104.956-59.952%20104.956%20197.257V297.764Z'%20fill='%23fff'/%3e%3cpath%20opacity='.2'%20d='M256.083%20163.833v103.4l90.408-51.667-90.408-51.733Z'%20fill='%23fff'/%3e%3cpath%20opacity='.6'%20d='m256.056%20163.833-90.473%2051.732%2090.473%2051.668v-103.4Z'%20fill='%23fff'/%3e%3cpath%20d='m256.056%2076.875-90.473%20138.724%2090.473-51.877V76.875Z'%20fill='%23fff'/%3e%3cpath%20opacity='.6'%20d='m256.083%20163.706%2090.477%2051.879-90.477-138.793v86.914Z'%20fill='%23fff'/%3e%3c/svg%3e" width="256" height="256" />
                                                                    </svg>
                                                                    <div className="text-sm font-medium">{collateralToken.symbol}</div>
                                                                </div>
                                                                <svg width="16" height="16" viewBox="0 0 16 16" className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                                                                    <path d="M13 6L8 11L3 6" stroke="#6A7692" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                            </button>

                                                            {isOpen && (
                                                                <div className="absolute top-full left-0 right-0 mt-1 bg-[#011B37] border border-[#142435] rounded-sm shadow-lg z-50">
                                                                    {collateralTokens.map((token, index) => (
                                                                        <button
                                                                            key={index}
                                                                            className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#142435] flex items-center gap-2"
                                                                            onClick={() => handleCollateralTokenChange(token)}
                                                                        >
                                                                            <svg viewBox="0 0 256 256" className="h-5 w-5">
                                                                                <image x="0" y="0" href="data:image/svg+xml,%3csvg%20width='512'%20height='512'%20viewBox='0%200%20512%20512'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3crect%20width='512'%20height='512'%20rx='256'%20fill='%2300A3FF'/%3e%3cpath%20opacity='.6'%20d='m361.012%20237.812%202.866%204.397c32.326%2049.589%2025.106%20114.533-17.358%20156.139-24.981%2024.478-57.722%2036.718-90.464%2036.721l104.956-197.257Z'%20fill='%23fff'/%3e%3cpath%20opacity='.2'%20d='M256.044%20297.764%20361%20237.812%20256.044%20435.069V297.764Z'%20fill='%23fff'/%3e%3cpath%20d='m150.988%20237.812-2.866%204.397c-32.326%2049.589-25.106%20114.533%2017.358%20156.139%2024.981%2024.478%2057.722%2036.718%2090.464%2036.721L150.988%20237.812Z'%20fill='%23fff'/%3e%3cpath%20opacity='.6'%20d='m255.914%20297.764-104.956-59.952%20104.956%20197.257V297.764Z'%20fill='%23fff'/%3e%3cpath%20opacity='.2'%20d='M256.083%20163.833v103.4l90.408-51.667-90.408-51.733Z'%20fill='%23fff'/%3e%3cpath%20opacity='.6'%20d='m256.056%20163.833-90.473%2051.732%2090.473%2051.668v-103.4Z'%20fill='%23fff'/%3e%3cpath%20d='m256.056%2076.875-90.473%20138.724%2090.473-51.877V76.875Z'%20fill='%23fff'/%3e%3cpath%20opacity='.6'%20d='m256.083%20163.706%2090.477%2051.879-90.477-138.793v86.914Z'%20fill='%23fff'/%3e%3c/svg%3e" width="256" height="256" />
                                                                            </svg>
                                                                            {token.symbol}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex min-w-0 flex-col gap-0.5">
                                                            <Input name="amountCollateral" placeholder="0" onChange={handleInputChange} value={inputValue?.amountCollateral} />
                                                            <div data-testid="component-AssetInput-inputUsdValue" className="text-xs truncate text-gray-500">{ }</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </section>

                                <section className="rounded-sm p-0 flex flex-col" data-testid="easyBorrow-form-borrow">
                                    <section className="rounded-sm p-4 sm:p-5 md:p-8 flex flex-1 flex-col gap-4 bg-gradient-to-r from-slate-900 to-gray-950">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xl font-semibold h-8 text-white">Borrow</h4>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <div className="grid items-center gap-3 p-2 pr-4 rounded-sm border border-[#142435] to-gray-950 focus-within:border-[#084FAA] grid-cols-[auto_1fr]">
                                                <div className="min-w-[120px]">
                                                    <button type="button" role="combobox" aria-controls="radix-:r1l:" aria-expanded="false" aria-autocomplete="none" dir="ltr" data-state="closed" className="group flex w-full items-center justify-between rounded-sm border border-[#142435] bg-[#011B37] text-white p-3 placeholder:text-gray-500 hover:border-gray-400 hover:shadow-sm disabled:cursor-not-allowed disabled:border-gray-200 disabled:opacity-50 disabled:shadow-sm focus-visible:outline-none focus-visible:ring focus-visible:ring-blue-200 focus-visible:ring-offset-0 data-[state=open]:border-gray-200 data-[state=open]:shadow-sm" data-testid="component-AssetSelector-trigger">
                                                        <div className="flex flex-row items-center gap-2">
                                                            <img className="h-6 w-6" src={SpiralStakeLogo} alt="" />
                                                            <div className="text-sm font-medium">SPIUSD</div>
                                                        </div>
                                                    </button>
                                                </div>
                                                <div className="flex min-w-0 flex-col gap-0.5">
                                                    <Input name="amountSpiUsd" placeholder="0" onChange={handleInputChange} value={inputValue?.amountSpiUsd} />
                                                    <div data-testid="component-AssetInput-inputUsdValue" className="text-xs truncate text-gray-500">${inputValue?.amountSpiUsd || "0.00"}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </section>
                            </div>

                            <section className="rounded-sm text-white p-4 sm:p-5 md:p-8">
                                <div className="flex flex-col gap-6">
                                    <div className="flex flex-col gap-1">
                                        <div className="text-xl font-semibold flex flex-row justify-between text-white">
                                            <h4>Loan to Value (LTV)</h4>
                                            <h4 data-testid="easyBorrow-form-ltv">79.00%</h4>
                                        </div>
                                        <div className="text-sm mt-2 flex flex-row justify-between text-gray-500">
                                            <div>Ratio of the collateral value to the borrowed value</div>
                                            <div className="text-right">max. 79.00%</div>
                                        </div>
                                    </div>
                                    <div className="px-2.5">
                                        <span dir="ltr" data-orientation="horizontal" aria-disabled="false" className="relative my-8 flex w-full touch-none select-none items-center" style={{ "--radix-slider-thumb-transform": "translateX(-50%)" }}>
                                            <span data-orientation="horizontal" className="relative grid h-5 w-full gap-0.5" style={{ gridTemplateColumns: "26.67% 13.33% 40% 20%" }}>
                                                <div className="flex h-full items-center justify-center bg-gray-200 transition-colors duration-300 -ml-2.5 rounded-l-full">
                                                    <div className="-bottom-6 text-xs absolute text-gray-500">Conservative</div>
                                                </div>
                                                <div className="flex h-full items-center justify-center bg-gray-200 transition-colors duration-300">
                                                    <div className="-bottom-6 text-xs absolute text-gray-500">Moderate</div>
                                                </div>
                                                <div className="flex h-full items-center justify-center bg-gray-200 transition-colors duration-300">
                                                    <div className="-bottom-6 text-xs absolute text-white">Aggressive</div>
                                                </div>
                                                <div className="flex h-full items-center justify-center bg-gray-200 transition-colors duration-300 -ml-0.5 -mr-1 rounded-r-full">
                                                    <div className="-bottom-6 text-xs absolute text-gray-500">Liquidation</div>
                                                </div>
                                                <div className="absolute top-0.5 bottom-0.5 w-0.5 bg-gradient-to-r from-blue-500 to-purple-500" style={{ left: "79%" }}></div>
                                                <div className="absolute flex h-full w-0.5 justify-center" style={{ left: "80%" }}>
                                                    <div className="absolute top-0.5 bottom-0.5 w-0.5 bg-gradient-to-r from-red-500 to-red-600" style={{ left: "79%" }}></div>
                                                    <div className="text-xs absolute bottom-7 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">80.00%</div>
                                                </div>
                                                <span data-orientation="horizontal" className="-mr-2.5 -ml-2.5 absolute h-full rounded-full bg-gradient-to-r from-red-500 to-red-600" style={{ left: "0%", right: "21.0002%" }}></span>
                                            </span>
                                            <span style={{ transform: "var(--radix-slider-thumb-transform)", position: "absolute", left: "calc(78.9998% + 0px)" }}>
                                                <span role="slider" aria-valuemin="0" aria-valuemax="10000" aria-orientation="horizontal" data-orientation="horizontal" tabIndex={0} className="transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50" data-radix-collection-item="" aria-valuenow="7899.980471833878">
                                                    <div className="flex transform items-center justify-center rounded-full bg-white p-0.5 transition-transform hover:scale-125 border border-[#142435]">
                                                        <img className="h-3 w-3" src="data:image/svg+xml,%3csvg%20width='10'%20height='10'%20viewBox='0%200%2010%2010'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M6.19416%205.61765H9.73349C9.87121%205.61765%209.91205%205.43009%209.78681%205.37281L6.19352%203.72939L6.19352%200.128422C6.19352%20-0.00576997%206.0135%20-0.0498007%205.95158%200.0692454L4.46004%202.93674L2.79457%202.17796C2.68398%202.12758%202.57189%202.24502%202.62735%202.35317L3.66797%204.38235L0.128503%204.38235C-0.00920611%204.38235%20-0.0500559%204.56989%200.0751746%204.62718L3.66862%206.2711L3.66862%209.87158C3.66862%2010.0058%203.84863%2010.0498%203.91055%209.93075L5.40196%207.0635L7.06478%207.82364C7.1753%207.87416%207.28754%207.75688%207.23223%207.64866L6.19416%205.61765Z'%20fill='url(%23paint0_linear_6022_1414)'/%3e%3cdefs%3e%3clinearGradient%20id='paint0_linear_6022_1414'%20x1='10.5289'%20y1='4.40741'%20x2='-0.332136'%20y2='4.22359'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%23FFCD4D'/%3e%3cstop%20offset='1'%20stop-color='%23FA43BD'/%3e%3c/linearGradient%3e%3c/defs%3e%3c/svg%3e" />
                                                    </div>
                                                </span>
                                            </span>
                                        </span>
                                        <input defaultValue="7899.980471833878" style={{ display: "none" }} />
                                    </div>
                                </div>
                            </section>

                        </div>

                        <div className="xl:hidden">
                            <section className="rounded-sm bg-gray-900 text-white p-0 grid h-fit grid-cols-1 sm:grid-cols-[3fr_2fr] xl:grid-cols-1">
                                <section className="rounded-sm bg-gray-800 text-white p-4 sm:p-5 md:p-8 flex flex-col justify-end gap-3 only:col-span-2">
                                    <h4 className="text-xl font-semibold">Borrow Rate</h4>
                                    <div className="flex flex-col gap-3">
                                        <h3 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent" data-testid="easyBorrow-form-borrowRate">5.02%</h3>
                                        <div className="text-base">Borrow assets directly from SKY</div>
                                    </div>
                                </section>
                            </section>
                        </div>
                    </section >
                    <div>
                        <ActionBtn
                            text={actionBtn.text}
                            disabled={actionBtn.disabled}
                            expectedChainId={Number(chainId)}
                            onClick={actionBtn.onClick}
                        />
                    </div>
                </form >

                {/* INFO SECTION */}
                < div className="sticky top-2 hidden h-fit xl:block" >
                    <section className="rounded-sm p-0 grid h-fit grid-cols-1 sm:grid-cols-[3fr_2fr] xl:grid-cols-1">
                        <section className="rounded-sm bg-gradient-to-b from-slate-900 to-gray-950 text-white p-4 sm:p-5 md:p-8 flex flex-col justify-end gap-3 col-span-2">
                            <h4 className="text-lg font-semibold">Borrow Rate</h4>
                            <div className="flex flex-col gap-3">
                                <h3 className="text-4xl font-bold bg-gradient-to-r from-orange-100 to-orange-600 bg-clip-text text-transparent" data-testid="easyBorrow-form-borrowRate">
                                    5.02%
                                </h3>
                                <div className="text-sm text-gray-300">
                                    Borrow SPIUSD directly from your Staked Stablecoins
                                </div>
                            </div>
                        </section>
                    </section>
                </div >
            </div >

        </div >
    );
};

export default Borrow;