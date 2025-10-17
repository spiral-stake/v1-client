import { useMemo, useState } from "react";
import axios from "axios";
import BigNumber from "bignumber.js";
import { useAccount, useChainId } from "wagmi";

import FlashLeverage from "../contract-hooks/FlashLeverage";
import { InternalReswapData, LeveragePosition } from "../types/index";
import { calcLeverage, calcLeverageApy, isMatured } from "../utils";
import { displayTokenAmount } from "../utils/displayTokenAmounts";
import { getSlippage } from "../utils/getSlippage";
import { handleAsync } from "../utils/handleAsyncFunction";
import { toastSuccess, toastError } from "../utils/toastWrapper";
import ActionBtn from "./ActionBtn";
import BtnFull from "./low-level/BtnFull";
import Overlay from "./low-level/Overlay";
import BtnGreen from "./low-level/BtnGreen";
import CloseReviewOverlay from "./CloseReviewOverlay";
import LeverageBreakdown from "./LeverageBreakdown";
import { HoverInfo } from "./low-level/HoverInfo";
import MorphoLink from "./low-level/MorphoLink";
import { formatUnits } from "../utils/formatUnits";
import { getInternalReswapData } from "../api-services/swapAggregator";

const LeveragePositionCard = ({
  flashLeverage,
  leveragePosition,
  deleteLeveragePosition,
}: {
  flashLeverage: FlashLeverage;
  leveragePosition: LeveragePosition;
  deleteLeveragePosition: (positionId: number) => void;
}) => {
  const [showCloseReview, setShowCloseReview] = useState(false);
  const [loading, setLoading] = useState(false);
  // Result of simulation
  const [internalReswapData, setInternalReswapData] = useState<InternalReswapData | null>(null);
  const [amountReturnedSimulated, setAmountReturnedSimulated] = useState<BigNumber>(
    new BigNumber(0)
  );

  const { address } = useAccount();
  const chainId = useChainId();
  const appChainId = useChainId();

  // Derived / memoized values for render and logic
  const matured = useMemo(() => isMatured(leveragePosition.collateralToken), [leveragePosition]);
  const leverageApy = useMemo(() => {
    if (!leveragePosition.open) return undefined;
    return calcLeverageApy(
      leveragePosition.collateralToken.impliedApy,
      leveragePosition.collateralToken.borrowApy,
      leveragePosition.ltv
    );
  }, [leveragePosition]);
  const leverageMultiplier = useMemo(
    () => calcLeverage(leveragePosition.ltv),
    [leveragePosition.ltv]
  );
  const computedYieldGenerated = useMemo(() => {
    // (leveragedCollateral * valueInUsd) - loan - deposited
    try {
      return BigNumber.max(leveragePosition.amountLeveragedCollateral
        .multipliedBy(leveragePosition.collateralToken.valueInUsd)
        .minus(leveragePosition.amountLoan)
        .minus(leveragePosition.amountDepositedInUsd || 0), 0);
    } catch (e) {
      return new BigNumber(0);
    }
  }, [leveragePosition]);

  const fetchAndSimulateClose = async () => {
    setLoading(true);
    try {
      const autoSlippage = getSlippage(Number(leveragePosition.amountLeveragedCollateral));

      const _internalReswapData = await getInternalReswapData(
        appChainId,
        autoSlippage,
        flashLeverage,
        leveragePosition.collateralToken,
        leveragePosition.amountLeveragedCollateral
      );

      const simulation = await flashLeverage.simulate("unleverage", [
        address,
        leveragePosition.id,
        _internalReswapData.pendleSwap,
        _internalReswapData.tokenRedeemSy,
        _internalReswapData.minTokenOut,
        _internalReswapData.swapData,
        _internalReswapData.limitOrderData,
      ]);

      const rawReturned = (simulation?.result ?? 0) as unknown as bigint;
      const normalized = formatUnits(
        rawReturned,
        leveragePosition.collateralToken.loanToken.decimals
      );

      setInternalReswapData(_internalReswapData);
      setAmountReturnedSimulated(normalized);
      setShowCloseReview(true);

      setLoading(false);
    } catch (err: any) {
      toastError("Simulation Error", err.shortMessage);
      setLoading(false);
    }
  };

  const handleCloseLeveragePosition = async () => {
    if (!internalReswapData) return;
    setLoading(true);

    const amountReturned = await flashLeverage.unleverage(
      address as string,
      leveragePosition,
      internalReswapData.pendleSwap,
      internalReswapData.tokenRedeemSy,
      internalReswapData.minTokenOut,
      internalReswapData.swapData,
      internalReswapData.limitOrderData
    );

    if (chainId && Number(chainId) !== 31337) {
      axios.put("https://dapi.spiralstake.xyz/leverage/close", {
        user: leveragePosition.owner.toLowerCase(),
        positionId: leveragePosition.id,
      });
    }

    deleteLeveragePosition(leveragePosition.id);

    toastSuccess(
      "Position Closed",
      `Received ${displayTokenAmount(
        amountReturned as BigNumber,
        leveragePosition.collateralToken.loanToken
      )}`
    );
  };

  const renderStatusChip = useMemo(() => {
    if (!leveragePosition.open) return <StatusChip label="Closed" />;
    if (leveragePosition.liquidated) return <StatusChip label="Liquidated" />;

    return (
      <BtnFull
        btnLoading={!showCloseReview && loading}
        text="Close"
        onClick={fetchAndSimulateClose}
      />
    );
  }, [leveragePosition, matured, showCloseReview, loading, fetchAndSimulateClose]);

  return (
    <div>
      {matured && leveragePosition.open && (
        <div className="py-[5px] w-full text-center lg:text-start lg:w-fit px-[24px] bg-[#20374a] rounded-xl rounded-b-none">
          <p className="text-[#68EA6A] text-[14px]">Position Matured</p>
        </div>
      )}

      <div
        className="bg-white bg-opacity-[4%] rounded-xl w-full flex flex-col p-[24px] gap-[24px]"
        style={
          matured && leveragePosition.open
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
                alt={`${leveragePosition.collateralToken.symbol} token`}
              />
            </div>

            <div>
              <div className="text-[24px] font-semibold">{`${leveragePosition.collateralToken.symbol.split("-")[1]
                }`}</div>
            </div>

            <div className="text-[#68EA6A] flex items-center gap-1">
              <BtnGreen
                text={
                  leveragePosition.open && !matured
                    ? `${leverageApy}% APY (${leveragePosition.collateralToken.maturityDate})`
                    : `${leveragePosition.collateralToken.maturityDate}`
                }
              />

              <div className="hidden lg:block">
                {leveragePosition.open ? (
                  <HoverInfo
                    content={
                      <LeverageBreakdown
                        collateralTokenApy={leveragePosition.collateralToken.impliedApy}
                        borrowApy={leveragePosition.collateralToken.borrowApy}
                        leverage={leverageMultiplier}
                      />
                    }
                  />
                ) : null}
              </div>
            </div>
          </div>

          <div className="hidden lg:inline-flex">
            <div className="w-full flex items-center gap-[8px]">
              <div> {renderStatusChip}</div>
              <MorphoLink
                link={`https://app.morpho.org/ethereum/market/${leveragePosition.collateralToken.morphoMarketId}`}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-y-[8px] lg:grid grid-cols-[auto,auto] lg:gap-y-[14px] grid-rows-2 lg:grid-rows-1 lg:grid-cols-[1fr,1fr,1fr,1fr,1fr,1fr]">
          {leveragePosition.open && !matured ? (
            <OpenPositionView
              leveragePosition={leveragePosition}
              computedYieldGenerated={computedYieldGenerated}
            />
          ) : (
            <ClosedOrMaturedView
              leveragePosition={leveragePosition}
              computedYieldGenerated={computedYieldGenerated}
            />
          )}
        </div>

        {/* mobile close button */}
        <div className="inline-flex lg:hidden">
          <div className="w-full flex items-center gap-[8px]">
            {leveragePosition.open ? (
              !leveragePosition.liquidated ? (
                <BtnFull
                  btnLoading={!showCloseReview && loading}
                  text="Close"
                  onClick={fetchAndSimulateClose}
                />
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

            <MorphoLink
              link={`https://app.morpho.org/ethereum/market/${leveragePosition.collateralToken.morphoMarketId}`}
            />
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

// ---------------------------
// Small helper subcomponents (kept local for file cohesion). Move to their own files if they grow.
// ---------------------------

function StatusChip({ label }: { label: string }) {
  return (
    <div className="flex justify-center cursor-default border-[1px] border-white border-opacity-[8%] items-center bg-opacity-[8%] text-sm font-light min-w-[80px] h-10 text-white px-2.5 py-2 rounded-full outline-none bg-neutral-700">
      {label}
    </div>
  );
}

function OpenPositionView({
  leveragePosition,
  computedYieldGenerated,
}: {
  leveragePosition: LeveragePosition;
  computedYieldGenerated: BigNumber;
}) {
  return (
    <>
      <div className="col-span-1 flex justify-between items-start lg:flex-col gap-[4px] lg:gap-[8px]">
        <p className="text-[14px] text-gray-400">Amount Deposited</p>
        <div className="flex lg:flex-col items-end lg:items-start gap-[8px] text-[14px] lg:text-[16px]">
          {displayTokenAmount(leveragePosition.amountCollateral)}{" "}
          {leveragePosition.collateralToken.symbol}
          <div className="text-[14px] text-[#D7D7D7]">
            ${displayTokenAmount(leveragePosition.amountDepositedInUsd)}
          </div>
        </div>
      </div>

      <div className="col-span-1 flex justify-between items-start lg:flex-col gap-[4px] lg:gap-[8px]">
        <div className="flex items-center gap-[8px]">
          <p className="text-[14px] text-gray-400">Long amount</p>
          <p className="text-[12px] text-[#68EA6A] font-[500]">
            {calcLeverage(leveragePosition.ltv)}x
          </p>
        </div>
        <div className="flex lg:flex-col items-end lg:items-start gap-[8px] text-[14px] lg:text-[16px]">
          {displayTokenAmount(leveragePosition.amountLeveragedCollateral)}{" "}
          {leveragePosition.collateralToken.symbol}
          <div className="text-[14px] text-[#D7D7D7]">
            $
            {displayTokenAmount(
              leveragePosition.amountLeveragedCollateral.multipliedBy(
                leveragePosition.collateralToken.valueInUsd
              )
            )}
          </div>
        </div>
      </div>

      <div className="col-span-1 flex justify-between items-start lg:flex-col gap-[4px] lg:gap-[8px]">
        <p className="text-[14px] text-gray-400">Loan amount</p>
        <div className="flex lg:flex-col items-end lg:items-start gap-[8px] text-[14px] lg:text-[16px] truncate">
          <div>
            {displayTokenAmount(leveragePosition.amountLoan)}{" "}
            {leveragePosition.collateralToken.loanToken.symbol}
          </div>
          <div className="text-[14px] text-[#D7D7D7]">
            ${displayTokenAmount(leveragePosition.amountLoan)}
          </div>
        </div>
      </div>

      {/* <div className="col-span-1 flex justify-between items-start lg:flex-col gap-[4px] lg:gap-[8px]">
        <p className="text-[14px] text-gray-400">Yield Generated</p>
        <div className="flex lg:flex-col items-end lg:items-start gap-[8px] text-[14px] lg:text-[16px]">
          ${displayTokenAmount(computedYieldGenerated)}{" "}
          {leveragePosition.collateralToken.loanToken.symbol}
          <div className="text-[14px] text-[#D7D7D7]">
            {" "}
            ${displayTokenAmount(computedYieldGenerated)}
          </div>
        </div>
      </div> */}

      <div className="col-span-1 flex justify-between items-start lg:flex-col gap-[4px] lg:gap-[8px]">
        <p className="text-[14px] text-gray-400">LTV</p>
        <div className="flex lg:flex-col items-end lg:items-start gap-[8px] text-[14px] lg:text-[16px] truncate">
          <div>{leveragePosition.ltv}%</div>
          <div className="text-[14px] text-[#D7D7D7]">
            liq. {leveragePosition.collateralToken.liqLtv}%
          </div>
        </div>
      </div>

      <div className="col-span-1 flex justify-between items-start lg:flex-col gap-[4px] lg:gap-[8px]">
        <p className="text-[14px] text-gray-400">Price</p>
        <div className="flex lg:flex-col items-end lg:items-start gap-[8px] text-[14px] lg:text-[16px]">
          <BtnGreen
            text={`Current: $${Number(leveragePosition.collateralToken.valueInUsd).toFixed(3)}`}
          />
          <BtnGreen
            text={`Liquidation: $${(
              (Number(leveragePosition.ltv) / Number(leveragePosition.collateralToken.liqLtv)) *
              Number(leveragePosition.collateralToken.valueInUsd)
            ).toFixed(3)}`}
          />
        </div>
      </div>
    </>
  );
}

function ClosedOrMaturedView({
  leveragePosition,
  computedYieldGenerated,
}: {
  leveragePosition: LeveragePosition;
  computedYieldGenerated: BigNumber;
}) {
  return (
    <>
      <div className="col-span-1 flex justify-between items-start lg:flex-col gap-[4px] lg:gap-[8px]">
        <p className="text-[14px] text-gray-400">Amount Deposited</p>
        <div className="flex lg:flex-col items-end lg:items-start gap-[8px] text-[14px] lg:text-[16px]">
          ${displayTokenAmount(leveragePosition.amountDepositedInUsd)}
          <div className="text-[14px] text-[#D7D7D7]">
            {displayTokenAmount(leveragePosition.amountCollateral)}{" "}
            {leveragePosition.collateralToken.symbol}
          </div>
        </div>
      </div>

      {leveragePosition.open ? (
        <div className="col-span-1 flex justify-between items-start lg:flex-col gap-[4px] lg:gap-[8px]">
          <p className="text-[14px] text-gray-400">Yield Generated</p>
          <div className="flex lg:flex-col items-end lg:items-start gap-[8px] text-[14px] lg:text-[16px]">
            {displayTokenAmount(computedYieldGenerated)} {leveragePosition.collateralToken.loanToken.symbol}
            <div className="text-[14px] text-[#D7D7D7]">
              ${displayTokenAmount(computedYieldGenerated)}
            </div>
          </div>
        </div>
      ) : (
        leveragePosition.amountReturnedInUsd ? <>
          <div className="col-span-1 flex justify-between items-start lg:flex-col gap-[4px] lg:gap-[8px]">
            <p className="text-[14px] text-gray-400">Amount Returned</p>
            <div className="flex lg:flex-col items-end lg:items-start gap-[8px] text-[14px] lg:text-[16px]">
              <div className="text-[14px] text-[#D7D7D7]">
                {displayTokenAmount(leveragePosition.amountReturnedInUsd)} {leveragePosition.collateralToken.loanToken.symbol}
              </div>
              ${displayTokenAmount(leveragePosition.amountReturnedInUsd)}
            </div>
          </div>

          <div className="col-span-1 flex justify-between items-start lg:flex-col gap-[4px] lg:gap-[8px]">
            <p className="text-[14px] text-gray-400">Yield Generated</p>
            <div className="flex lg:flex-col items-end lg:items-start gap-[8px] text-[14px] lg:text-[16px]">
              <div className="text-[14px] text-[#D7D7D7]">
                {displayTokenAmount(
                  BigNumber.max(
                    leveragePosition.amountReturnedInUsd.minus(leveragePosition.amountDepositedInUsd)
                  )
                )} {leveragePosition.collateralToken.loanToken.symbol}
              </div>
              $
              {displayTokenAmount(
                BigNumber.max(
                  leveragePosition.amountReturnedInUsd.minus(leveragePosition.amountDepositedInUsd)
                )
              )}
            </div>
          </div>
        </> : null
      )}
    </>
  );
}
