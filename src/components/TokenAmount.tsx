import { useEffect, useRef, useState } from "react";
import { HoverInfo } from "./low-level/HoverInfo";
import { Token } from "../types";
import DropdownIcon from "./low-level/DropDownIcon";
import BigNumber from "bignumber.js";
import Input from "./low-level/Input";
import { displayTokenAmount } from "../utils/displayTokenAmounts";

const TokenAmount = ({
    title,
    titleHoverInfo,
    tokens,
    selectedToken,
    handleTokenChange,
    amount,
    handleAmountChange,
    amountInUsd,
    bgStyle
}: {
    title: string;
    titleHoverInfo?: string;
    tokens?: Token[];
    selectedToken: Token;
    handleTokenChange?: (token: Token) => void;
    amount: string;
    handleAmountChange: (amount: any) => void;
    amountInUsd: BigNumber,
    bgStyle: string
}) => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setIsOpen(false);
    }, [selectedToken]);

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

    return (
        <section className={`rounded-sm text-white p-4 sm:p-5 md:p-8 flex flex-1 flex-col gap-4 ${bgStyle}`} >
            <div className="flex items-center justify-between">
                <div className="flex h-8 flex-row items-center gap-1">
                    <h4 className="text-xl font-semibold text-white">{title}</h4>
                    {titleHoverInfo && <HoverInfo content={titleHoverInfo} />}
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
                                    className={`group flex w-full gap-2 items-center justify-between rounded-sm border border-[#142435] bg-[#011B37] text-white p-3 ${tokens && "hover:border-gray-400 focus-visible:outline-none focus-visible:ring focus-visible:ring-blue-200"}`}
                                >
                                    <div className="flex flex-row items-center gap-2">
                                        {/* Need to add Symbol */}
                                        <div className="text-sm font-medium">{selectedToken.symbol}</div>
                                    </div>
                                    {tokens && <DropdownIcon isOpen={isOpen} />}
                                </button>

                                {isOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#011B37] border border-[#142435] rounded-sm shadow-lg z-50">
                                        {tokens?.map((token, index) => (
                                            <button
                                                key={index}
                                                className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#142435] flex items-center gap-2"
                                                onClick={() => handleTokenChange && handleTokenChange(token)}
                                            >
                                                {/* Need to add token icon */}
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
                                    onChange={(e: any) => handleAmountChange(e.target.value)}
                                    value={amount}
                                />
                                <div
                                    data-testid="component-AssetInput-inputUsdValue"
                                    className="text-xs truncate text-gray-400"
                                >
                                    ${displayTokenAmount(amountInUsd, undefined, 2)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section >
    );
};

export default TokenAmount;
