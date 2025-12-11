import BigNumber from "bignumber.js";
import { useState, useEffect, useRef } from "react";
import { CollateralToken, Token } from "../../types/index.ts";
import { displayTokenAmount } from "../../utils/displayTokenAmounts.ts";
import DropdownIcon from "./DropDownIcon.tsx";
import Input from "./Input.tsx";
import wallet from "../../assets/icons/wallet.svg";
import truncateStr from "../../utils/truncateStr.ts";


const TokenAmount = ({
  maxLeverageAmount,
  tokens,
  selectedToken,
  handleTokenChange,
  amount,
  handleAmountChange,
  amountInUsd,
  warning,
  error,
  balance,
  setAmountToMax,
}: {
  tokens?: Token[];
  selectedToken: Token;
  handleTokenChange?: (token: Token) => void;
  amount: string;
  handleAmountChange: (amount: any) => void;
  amountInUsd: BigNumber;
  error?: string;
  warning?: string;
  balance: BigNumber;
  setAmountToMax: (maxLeverageAmount: BigNumber) => void;
  maxLeverageAmount: BigNumber;
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
            onChange={(e: any) => handleAmountChange(e.target.value)}
            value={amount}
          />

          {/* change token */}
          <div className="relative transition-all duration-300" ref={ref}>
            <div
              onClick={() => setIsOpen(!isOpen)}
              className={`cursor-pointer flex w-full h-[45px] gap-[8px] items-center ${isOpen ? "rounded-b-none border-b-0" : ""
                } rounded-[12px] p-[11px] border-[1px] border-[white] border-opacity-[10%] text-white`}
            >
              {/* Need to add Symbol */}
              <div className="flex items-center gap-[6px] w-[100px]">
                {tokens && (
                  <img
                    src={`/tokens/${selectedToken.symbolExtended || selectedToken.symbol
                      }.svg`}
                    alt=""
                    className="w-[20px]"
                  />
                )}
                <p className="truncate text-[16px] font-normal">
                  {selectedToken.symbol}
                </p>
              </div>

              {tokens && (
                <div className="flex items-center">
                  <DropdownIcon isOpen={isOpen} />
                </div>
              )}
            </div>

            {isOpen && (
              <div className="absolute top-full left-0 right-0 bg-[#13151c] border-[1px] border-white border-opacity-[10%] border-t-0 rounded-t-none rounded-[12px] z-50">
                {tokens?.map((token, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#212533] flex items-center gap-2"
                    onClick={() =>
                      handleTokenChange &&
                      handleTokenChange(token) &&
                      setIsOpen(!isOpen)
                    }
                  >
                    {/* Need to add token icon */}
                    <img
                      src={`/tokens/${tokens[index].symbolExtended || tokens[index].symbol
                        }.svg`}
                      alt=""
                      className="w-[20px]"
                    />
                    {token.symbol}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* input amount display */}
        <div
          data-testid="component-AssetInput-inputUsdValue"
          className="text-[14px] truncate text-[#8E8E8E] font-normal"
        >
          ${displayTokenAmount(amountInUsd, undefined, 2)}
        </div>
      </div>

      {(error || warning) && (
        <div
          className={`p-[8px] rounded-[12px] text-sm ${error ? "bg-[#ED2A231A] text-red-600" : "bg-[#F7981D1A] text-orange-600"
            }`}
        >
          {error ? (
            error
          ) : (
            <p>
              You have to deposit more than
              <span className="text-[#F7981DCC]">{" >5000 "}</span>for better returns.
            </p>
          )}
        </div>
      )}

      {/* MAX part */}
      <div className="flex text-[14px] items-center justify-between">
        <div className="flex items-center gap-[4px]">
          <img src={wallet} alt="" />
          <p className="text-[#8E8E8E]">
            {displayTokenAmount(balance)}{" "}
            {truncateStr(selectedToken.symbol, 12)}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {/* <p className="text-[#8E8E8E]">${formatNumber(maxLeverageAmount)}</p> */}
          <p
            className="cursor-pointer"
            onClick={() => setAmountToMax(maxLeverageAmount)}
          >
            MAX
          </p>
        </div>
      </div>
    </section>
  );
};

export default TokenAmount;
