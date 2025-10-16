import axios from "axios";
import BigNumber from "bignumber.js";
import { useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { getInternalReswapData } from "../api-services/swapAggregator";
import FlashLeverage from "../contract-hooks/FlashLeverage";
import { InternalReswapData, LeveragePosition } from "../types";
import { calcLeverage, calcLeverageApy, isMatured } from "../utils";
import { displayTokenAmount } from "../utils/displayTokenAmounts";
import { getSlippage } from "../utils/getSlippage";
import { handleAsync } from "../utils/handleAsyncFunction";
import { toastSuccess } from "../utils/toastWrapper";
import ActionBtn from "./ActionBtn";
import BtnFull from "./low-level/BtnFull";
import Overlay from "./low-level/Overlay";
import BtnGreen from "./low-level/BtnGreen";
import CloseReviewOverlay from "./CloseReviewOverlay";
import LeverageBreakdown from "./LeverageBreakdown";
import { HoverInfo } from "./low-level/HoverInfo";
import MorphoLink from "./low-level/MorphoLink";
import { formatUnits } from "../utils/formatUnits";

const LeveragePositionCard = ({
  flashLeverage,
  leveragePosition,
  deleteLeveragePosition,
}: {
  flashLeverage: FlashLeverage;
  leveragePosition: LeveragePosition;
  deleteLeveragePosition: (positionId: number) => void;
}) => {
  const { address, chainId } = useAccount();
  const [showCloseReview, setShowCloseReview] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [internalReswapData, setInternalReswapData] = useState<InternalReswapData>();
  const [amountReturnedSimulated, setAmountReturnedSimulated] = useState<BigNumber>(BigNumber(0));

  const appChainId = useChainId();

  const fetchInternalReswapData = async () => {
    try {
      setLoading(true);

      const autoSlippage = getSlippage(Number(leveragePosition.amountLeveragedCollateral));

      const _internalReswapData = await getInternalReswapData(
        appChainId,
        autoSlippage,
        flashLeverage,
        leveragePosition.collateralToken,
        leveragePosition.amountLeveragedCollateral
      );

      const _amountReturnedSimulated = (
        await flashLeverage.simulate("unleverage", [
          address as string,
          leveragePosition.id,
          _internalReswapData.pendleSwap,
          _internalReswapData.tokenRedeemSy,
          _internalReswapData.minTokenOut,
          _internalReswapData.swapData,
          _internalReswapData.limitOrderData,
        ])
      ).result as unknown as bigint;

      setInternalReswapData(_internalReswapData);
      setAmountReturnedSimulated(
        formatUnits(_amountReturnedSimulated, leveragePosition.collateralToken.loanToken.decimals)
      );

      setShowCloseReview(true);
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };

  const handleCloseLeveragePosition = async () => {
    if (!internalReswapData) return;

    const amountReturned = await flashLeverage.unleverage(
      address as string,
      leveragePosition,
      internalReswapData.pendleSwap,
      internalReswapData.tokenRedeemSy,
      internalReswapData.minTokenOut,
      internalReswapData.swapData,
      internalReswapData.limitOrderData
    );

    if (chainId !== 31337) {
      axios.put("https://dapi.spiralstake.xyz/leverage/close", {
        user: leveragePosition.owner.toLowerCase(),
        positionId: leveragePosition.id,
      });
    }

    deleteLeveragePosition(leveragePosition.id);
    toastSuccess(
      "Position Closed",
      `Received ${displayTokenAmount(amountReturned as BigNumber, leveragePosition.collateralToken.loanToken)}`
    );
  };

  return (
    <div>
      {isMatured(leveragePosition.collateralToken) && leveragePosition.open && (
        <div className="py-[5px] w-full text-center lg:text-start lg:w-fit px-[24px] bg-[#20374a] rounded-xl rounded-b-none">
          <p className="text-[#68EA6A] text-[14px]">Position Matured</p>
        </div>
      )}
      <div
        className="bg-white bg-opacity-[4%] rounded-xl w-full flex flex-col p-[24px] gap-[24px]"
        style={
          isMatured(leveragePosition.collateralToken) && leveragePosition.open
            ? { borderTopLeftRadius: 0, borderTopRightRadius: 0 }
            : {}
        }
      >
        <div className="w-full flex items-center justify-between pb-[16px] lg:pb-0 lg:border-none border-b-[1px] border-white border-opacity-[6%]">
          <div className="flex items-center gap-[10px]">
            <div>
              <img
                className="w-[48px]"
                src={`/tokens/${leveragePosition.collateralToken.symbolExtended}.svg`}
                alt=""
              />
            </div>
            <div>
              <div className="text-[24px] font-semibold">
                {`${leveragePosition.collateralToken.symbol.split("-")[1]}`}
              </div>
            </div>
            <div className="text-[#68EA6A] flex items-center gap-1">
              <BtnGreen
                text={`${leveragePosition.open ? `${calcLeverageApy(
                  leveragePosition.collateralToken.impliedApy,
                  leveragePosition.collateralToken.borrowApy,
                  leveragePosition.ltv
                )}% APY` : ""} (${leveragePosition.collateralToken.maturityDate})`}
              />
              <div className="hidden lg:block">
                {leveragePosition.open ? <HoverInfo
                  content={
                    <LeverageBreakdown
                      collateralTokenApy={leveragePosition.collateralToken.impliedApy}
                      borrowApy={leveragePosition.collateralToken.borrowApy}
                      leverage={calcLeverage(leveragePosition.ltv)}
                    />
                  }
                /> : null}
              </div>
            </div>
          </div>
          <div className="hidden lg:inline-flex">
            <div className="w-full flex items-center gap-[8px]">
              {leveragePosition.open ? (
                !leveragePosition.liquidated ? (
                  <div> <BtnFull btnLoading={!showCloseReview && loading} text="Close" onClick={() => fetchInternalReswapData()} /></div>
                ) : (
                  <div className="flex justify-center cursor-default border-[1px] border-white border-opacity-[8%] items-center bg-opacity-[8%] text-sm font-light min-w-[80px] h-10 text-white px-2.5 py-2 rounded-full outline-none bg-neutral-700">
                    Liquidated
                  </div>
                )
              ) : (
                <div className="flex justify-center cursor-default border-[1px] border-white border-opacity-[8%] items-center bg-opacity-[8%] text-sm font-light min-w-[80px] h-10 text-white px-2.5 py-2 rounded-full outline-none bg-neutral-700">
                  Closed
                </div>
              )}
              <MorphoLink link={`https://app.morpho.org/ethereum/market/${leveragePosition.collateralToken.morphoMarketId}`} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-y-[8px] lg:grid grid-cols-[auto,auto] lg:gap-y-[14px] grid-rows-2 lg:grid-rows-1 lg:grid-cols-[auto,auto,auto,auto,auto]">
          <div className="col-span-1 flex justify-between lg:flex-col gap-[4px] lg:gap-[8px]">
            <p className="text-[14px] text-gray-400">Amount Deposited</p>
            <div className="flex items-center gap-[8px] text-[16px]">
              {displayTokenAmount(leveragePosition.amountCollateral)} {leveragePosition.collateralToken.symbol}
              <div className="text-[14px] text-[#D7D7D7]">
                ${displayTokenAmount(leveragePosition.amountDepositedInUsd)}
              </div>
            </div>
          </div>

          {leveragePosition.open && (
            <>
              <div className="col-span-1 flex justify-between lg:flex-col gap-[4px] lg:gap-[8px]">
                <div className="flex items-center gap-[8px]">
                  <p className="text-[14px] text-gray-400">Long amount</p>
                  <p className="text-[12px] text-[#68EA6A] font-[500]">{calcLeverage(leveragePosition.ltv)}x</p>
                </div>
                <div className="flex items-center gap-[8px] text-[16px]">
                  {displayTokenAmount(leveragePosition.amountLeveragedCollateral)} {leveragePosition.collateralToken.symbol}
                  <div className="text-[14px] text-[#D7D7D7]">
                    ${displayTokenAmount(leveragePosition.amountLeveragedCollateral.multipliedBy(leveragePosition.collateralToken.valueInUsd))}
                  </div>
                </div>
              </div>

              <div className="col-span-1 flex justify-between lg:flex-col gap-[4px] lg:gap-[8px]">
                <p className="text-[14px] text-gray-400">Loan amount</p>
                <div className="flex items-center gap-[8px] text-[16px] truncate">
                  <div>{displayTokenAmount(leveragePosition.amountLoan)}</div>
                  <div className="text-[14px] text-[#D7D7D7]">{leveragePosition.collateralToken.loanToken.symbol}</div>
                </div>
              </div>

              <div className="col-span-1 flex justify-between lg:flex-col gap-[4px] lg:gap-[8px]">
                <p className="text-[14px] text-gray-400">LTV</p>
                <div className="flex items-center gap-[8px] text-[16px] truncate">
                  <div>{leveragePosition.ltv}%</div>
                  <div className="text-[14px] text-[#D7D7D7]">liq. {leveragePosition.collateralToken.liqLtv}%</div>
                </div>
              </div>

              <div className="col-span-1 flex justify-between lg:flex-col gap-[4px] lg:gap-[8px]">
                <p className="text-[14px] text-gray-400">Price</p>
                <div className="flex items-center gap-[8px] text-[16px]">
                  <BtnGreen text={`Current: $${Number(leveragePosition.collateralToken.valueInUsd).toFixed(3)}`} />
                  <BtnGreen
                    text={`Liquidation: $${((Number(leveragePosition.ltv) / Number(leveragePosition.collateralToken.liqLtv)) * Number(leveragePosition.collateralToken.valueInUsd)).toFixed(3)}`}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* mobile close button */}
        <div className="inline-flex lg:hidden">
          <div className="w-full flex items-center gap-[8px]">
            {leveragePosition.open ? (
              !leveragePosition.liquidated ? (
                <BtnFull btnLoading={!showCloseReview && loading} text="Close" onClick={() => fetchInternalReswapData()} />
              ) : (
                <div className="flex justify-center cursor-default border-[1px] border-white border-opacity-[8%] items-center bg-opacity-[8%] text-sm font-light min-w-[80px] h-10 text-white px-2.5 py-2 rounded-full outline-none w-full bg-neutral-700">
                  Liquidated
                </div>
              )
            ) : (
              <div className="flex justify-center cursor-default border-[1px] border-white border-opacity-[8%] items-center bg-opacity-[8%] text-sm font-light min-w-[80px] h-10 text-white px-2.5 py-2 rounded-full outline-none flex-1 bg-neutral-700">
                Closed
              </div>
            )}
            <MorphoLink link={`https://app.morpho.org/ethereum/market/${leveragePosition.collateralToken.morphoMarketId}`} />
          </div>
        </div>

        {showCloseReview && (
          <>
            {/* Desktop Close Review */}
            <div className="hidden z-10 fixed top-0 left-0 bg-black bg-opacity-[70%] lg:flex flex-col gap-[24px] justify-center items-end lg:items-center w-[100vw] h-[100vh]">
              <CloseReviewOverlay
                amountCollateral={Number(leveragePosition.amountCollateral)}
                leveragePosition={leveragePosition}
                setShowCloseReview={setShowCloseReview}
                amountReturnedSimulated={amountReturnedSimulated}
              />
              <div className="lg:w-[500px]">
                <ActionBtn
                  btnLoading={loading}
                  text="Close"
                  onClick={handleAsync(handleCloseLeveragePosition, setLoading)}
                  expectedChainId={Number(chainId)}
                />
              </div>
            </div>

            {/* Mobile Close Review */}
            <div className="lg:hidden">
              <Overlay
                onClose={() => setShowCloseReview(false)}
                overlay={
                  <div className="flex flex-col gap-[24px] pb-[70px] rounded-[16px] rounded-b-none bg-white bg-opacity-[10%] backdrop-blur-2xl">
                    <CloseReviewOverlay
                      amountCollateral={Number(leveragePosition.amountCollateral)}
                      leveragePosition={leveragePosition}
                      setShowCloseReview={setShowCloseReview}
                      amountReturnedSimulated={amountReturnedSimulated}
                    />
                    <div className="lg:w-[500px] px-2">
                      <ActionBtn
                        btnLoading={loading}
                        text="Close"
                        onClick={handleAsync(handleCloseLeveragePosition, setLoading)}
                        expectedChainId={Number(chainId)}
                      />
                    </div>
                  </div>
                }
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LeveragePositionCard;
