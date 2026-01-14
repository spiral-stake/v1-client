import { useMemo, useState } from "react";
import axios from "axios";
import BigNumber from "bignumber.js";
import { useAccount, useChainId } from "wagmi";

import FlashLeverage from "../contract-hooks/FlashLeverage";
import { InternalReswapData, LeveragePosition } from "../types/index";
import { calcLeverage } from "../utils";
import { displayTokenAmount } from "../utils/displayTokenAmounts";
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
import { getNetYieldUsd } from "../utils/getNetYieldUsd";
import AutoDeleverage from "./low-level/AutoLeverage";
import Info from "./Info";

const LeveragePositionCard = ({
  flashLeverage,
  leveragePosition: pos,
  deleteLeveragePosition,
}: {
  flashLeverage: FlashLeverage;
  leveragePosition: LeveragePosition;
  deleteLeveragePosition: (positionId: number) => void;
}) => {
  const [showCloseReview, setShowCloseReview] = useState(false);
  const [loading, setLoading] = useState(false);
  // Result of simulation
  const [internalReswapData, setInternalReswapData] =
    useState<InternalReswapData | null>(null);
  const [amountReturnedSimulated, setAmountReturnedSimulated] =
    useState<BigNumber>(new BigNumber(0));

  const { address } = useAccount();
  const chainId = useChainId();
  const appChainId = useChainId();

  const fetchAndSimulateClose = async () => {
    setLoading(true);
    try {
      const _internalReswapData = await getInternalReswapData(
        appChainId,
        flashLeverage,
        pos.collateralToken,
        pos.amountLeveragedCollateral
      );


      setInternalReswapData(_internalReswapData);

      const simulation = await flashLeverage.simulate("unleverage", [
        address,
        pos.id,
        _internalReswapData.pendleSwap,
        _internalReswapData.tokenRedeemSy,
        _internalReswapData.minTokenOut,
        _internalReswapData.swapData,
        _internalReswapData.limitOrderData,
      ]);

      const rawReturned = (simulation?.result ?? 0) as unknown as bigint;
      const normalized = formatUnits(
        rawReturned,
        pos.collateralToken.loanToken.decimals
      );

      setAmountReturnedSimulated(normalized);
      setShowCloseReview(true);

      setLoading(false);
    } catch (err: any) {
      setShowCloseReview(true);
      console.log(err);
      setLoading(false);
    }
  };

  const handleCloseLeveragePosition = async () => {
    if (!internalReswapData) return;
    setLoading(true);

    const amountReturned = await flashLeverage.unleverage(
      address as string,
      pos,
      internalReswapData.pendleSwap,
      internalReswapData.tokenRedeemSy,
      internalReswapData.minTokenOut,
      internalReswapData.swapData,
      internalReswapData.limitOrderData
    );

    if (chainId && Number(chainId) !== 31337) {
      axios.put("https://api.spiralstake.xyz/leverage/close", {
        user: pos.owner.toLowerCase(),
        positionId: pos.id,
        amountReturnedInUsd: amountReturned,
      });
    }

    deleteLeveragePosition(pos.id);

    toastSuccess(
      "Position Closed",
      `Received ${displayTokenAmount(
        amountReturned as BigNumber,
        pos.collateralToken.loanToken
      )}`
    );
  };

  const renderStatusChip = useMemo(() => {
    if (!pos.open) return <StatusChip label="Closed" />;
    if (pos.liquidated) return <StatusChip label="Liquidated" />;

    return (
      <BtnFull
        btnLoading={!showCloseReview && loading}
        text="Close"
        onClick={fetchAndSimulateClose}
      />
    );
  }, [pos, pos.isMatured, showCloseReview, loading, fetchAndSimulateClose]);

  return (
    <div>
      {pos.isMatured && pos.open && (
        <div className="py-[5px] w-full text-center lg:text-start lg:w-fit px-[24px] bg-[#20374a] rounded-xl rounded-b-none">
          <p className="text-[#68EA6A] text-[14px]">Position Matured</p>
        </div>
      )}

      <div
        className="bg-white bg-opacity-[4%] rounded-xl w-full flex flex-col p-[24px] gap-[24px]"
        style={
          pos.isMatured && pos.open
            ? { borderTopLeftRadius: 0, borderTopRightRadius: 0 }
            : {}
        }
      >
        <div className="w-full flex items-center justify-between pb-[16px] lg:pb-0 lg:border-none border-b-[1px] border-white border-opacity-[6%]">
          <div className="w-full lg:w-auto flex lg:flex-row flex-col lg:items-center gap-[16px] lg:gap-[10px]">
            <div className="w-full lg:w-auto flex items-center justify-between">
              <div className="flex items-center gap-[10px]">
                <div>
                  <img
                    className="w-[48px]"
                    src={`/tokens/${pos.collateralToken.symbolExtended}.svg`}
                    alt={`${pos.collateralToken.symbol} token`}
                  />
                </div>

                <div>
                  <div className="text-[24px] font-semibold">{`${pos.collateralToken.symbol.split("-")[1]
                    }`}</div>
                </div>
              </div>
              {pos.open && (
                <div className="lg:hidden">
                  <AutoDeleverage />
                </div>
              )}
            </div>

            <div className="text-[#68EA6A] flex items-center justify-normal gap-1">
              <div
                className="inline-flex"
                style={pos.open ? { color: "#68EA6A" } : { color: "gray" }}
              >
                {pos.open ? (
                  <BtnGreen text={`Opened ${pos.openedOn} Days ago`} />
                ) : (
                  Number(pos.heldFor) > 0 && (
                    <BtnGreen text={`Held for ${pos.heldFor} Days`} />
                  )
                )}
              </div>

              <div style={pos.open ? { color: "#68EA6A" } : { color: "gray" }}>
                <BtnGreen
                  text={
                    pos.open && !pos.isMatured
                      ? `${pos.leverageApy}% APY (${pos.collateralToken.maturityDate} - ${pos.collateralToken.maturityDaysLeft} Days)`
                      : `${pos.collateralToken.maturityDate}`
                  }
                />
              </div>

              <div className="hidden lg:inline-flex">
                {pos.open ? (
                  <HoverInfo
                    content={
                      <LeverageBreakdown
                        collateralTokenApy={pos.collateralToken.impliedApy}
                        borrowApy={pos.collateralToken.borrowApy}
                        leverage={pos.leverage}
                      />
                    }
                  />
                ) : null}
              </div>
            </div>
          </div>

          <div className="hidden lg:inline-flex">
            <div className="w-full flex items-center gap-[8px]">
              {pos.open && <AutoDeleverage />}
              <div> {renderStatusChip}</div>
              <MorphoLink
                link={`https://app.morpho.org/ethereum/market/${pos.collateralToken.morphoMarketId}`}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-y-[12px] lg:grid grid-cols-[auto,auto] lg:gap-y-[14px] grid-rows-2 lg:grid-rows-1 lg:grid-cols-[1fr,1fr,1fr,1fr,1fr,1fr]">
          {pos.open && !pos.isMatured ? (
            <OpenPositionView
              pos={pos}
              yieldGenerated={pos.yieldGenerated || BigNumber(0)}
            />
          ) : (
            <ClosedOrMaturedView
              pos={pos}
              yieldGenerated={pos.yieldGenerated || BigNumber(0)}
            />
          )}
        </div>

        {/* mobile close button */}
        <div className="inline-flex lg:hidden">
          <div className="w-full flex items-center gap-[8px]">
            {pos.open ? (
              !pos.liquidated ? (
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
              link={`https://app.morpho.org/ethereum/market/${pos.collateralToken.morphoMarketId}`}
            />
          </div>
        </div>

        {showCloseReview && (
          <>
            {/* Desktop Close Review */}
            <div className="hidden z-10 fixed top-0 left-0 bg-black bg-opacity-[70%] lg:flex flex-col gap-[24px] justify-center items-end lg:items-center w-[100vw] h-[100vh]">
              <CloseReviewOverlay
                amountCollateral={Number(pos.amountCollateral)}
                pos={pos}
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
                      amountCollateral={Number(pos.amountCollateral)}
                      pos={pos}
                      setShowCloseReview={setShowCloseReview}
                      amountReturnedSimulated={amountReturnedSimulated}
                    />

                    <div className="lg:w-[500px] px-2">
                      <ActionBtn
                        btnLoading={loading}
                        text="Close"
                        onClick={handleAsync(
                          handleCloseLeveragePosition,
                          setLoading
                        )}
                        expectedChainId={Number(chainId)}
                      />
                    </div>
                  </div>
                }
              />
            </div>
          </>
        )}
        {address === "0xC0F062C16aa3f81E1dee61b85C8f91CaEE8ae621" && <Info flashLeverage={flashLeverage} pos={pos} />}
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
  pos,
  yieldGenerated,
}: {
  pos: LeveragePosition;
  yieldGenerated: BigNumber;
}) {
  return (
    <>
      <div className="col-span-1 flex justify-between items-start lg:flex-col gap-[4px] lg:gap-[8px]">
        <p className="text-[14px] text-gray-400">Amount Deposited</p>
        <div className="flex flex-col items-end lg:items-start lg:gap-[8px] text-[14px] lg:text-[16px]">
          {displayTokenAmount(pos.amountCollateral)}{" "}
          {pos.collateralToken.symbol}
          <div className="text-[14px] text-[#D7D7D7]">
            ${displayTokenAmount(pos.amountDepositedInUsd)}
          </div>
        </div>
      </div>

      <div className="col-span-1 flex justify-between items-start lg:flex-col gap-[4px] lg:gap-[8px]">
        <div className="flex items-center gap-[8px]">
          <p className="text-[14px] text-gray-400">Long amount</p>
          <p className="text-[12px] text-[#68EA6A] font-[500]">
            {calcLeverage(pos.ltv)}x
          </p>
        </div>
        <div className="flex flex-col items-end lg:items-start lg:gap-[8px] text-[14px] lg:text-[16px]">
          {displayTokenAmount(pos.amountLeveragedCollateral)}{" "}
          {pos.collateralToken.symbol}
          <div className="text-[14px] text-[#D7D7D7]">
            $
            {displayTokenAmount(
              pos.amountLeveragedCollateral.multipliedBy(
                pos.collateralToken.valueInUsd
              )
            )}
          </div>
        </div>
      </div>

      <div className="col-span-1 flex justify-between items-start lg:flex-col gap-[4px] lg:gap-[8px]">
        <p className="text-[14px] text-gray-400">Loan amount</p>
        <div className="flex flex-col items-end lg:items-start lg:gap-[8px] text-[14px] lg:text-[16px] truncate">
          <div>
            {displayTokenAmount(pos.amountLoan)}{" "}
            {pos.collateralToken.loanToken.symbol}
          </div>
          <div className="text-[14px] text-[#D7D7D7]">
            ${displayTokenAmount(pos.amountLoan)}
          </div>
        </div>
      </div>

      <div className="col-span-1 flex justify-between items-start lg:flex-col gap-[4px] lg:gap-[8px]">
        <div className="flex items-center gap-[4px]">
          <p className="text-[14px] text-gray-400">Projected Yield</p>
          <HoverInfo
            content={
              <div className="max-w-[200px] lg:max-w-[350px] flex flex-col gap-[14px] border-[1px] border-white border-opacity-[10%] py-[12px] px-[16px]  bg-white bg-opacity-[4%] rounded-[16px]">
                <p className="text-[14px] font-[400] text-gray-300">
                  Projected yields vary dynamically based on the borrow APY
                  shifts across Morpho pools
                </p>
                <div className="flex flex-col lg:flex-row justify-between items-start gap-[12px] lg:gap-[6px]">
                  <p className="text-[14px] text-gray-400">Yield Generated</p>
                  <div className="flex flex-col lg:flex-row items-start gap-[6px] lg:gap-[4px] text-[14px] lg:text-[14px]">
                    {displayTokenAmount(BigNumber.max(yieldGenerated, 0))}{" "}
                    {pos.collateralToken.loanToken.symbol}
                    <div className="text-[12px] text-[#D7D7D7]">
                      {" "}
                      (${displayTokenAmount(BigNumber.max(yieldGenerated, 0))})
                    </div>
                  </div>
                </div>
              </div>
            }
          />
        </div>
        <div className="flex flex-col items-end lg:items-start lg:gap-[8px] text-[14px] lg:text-[16px]">
          {Math.max(
            Number(
              displayTokenAmount(
                BigNumber(
                  getNetYieldUsd(
                    Number(pos.amountDepositedInUsd),
                    pos.leverageApy,
                    pos.leverage,
                    pos.collateralToken.maturityDaysLeft,
                    false,
                    false
                  ).toString()
                ).plus(BigNumber(pos.yieldGenerated))
              )
            ),
            0
          )}{" "}
          {""}
          {pos.collateralToken.loanToken.symbol}
          <div className="text-[14px] text-[#D7D7D7]">
            $
            {Math.max(
              Number(
                displayTokenAmount(
                  BigNumber(
                    getNetYieldUsd(
                      Number(pos.amountDepositedInUsd),
                      pos.leverageApy,
                      pos.leverage,
                      pos.collateralToken.maturityDaysLeft,
                      false,
                      false
                    ).toString()
                  ).plus(BigNumber(pos.yieldGenerated))
                )
              ),
              0
            )}
          </div>
        </div>
      </div>

      <div className="col-span-1 flex justify-between items-start lg:flex-col gap-[4px] lg:gap-[8px]">
        <p className="text-[14px] text-gray-400">LTV</p>
        <div className="flex flex-col items-end lg:items-start lg:gap-[8px] text-[14px] lg:text-[16px] truncate">
          <div>{pos.ltv}%</div>
          <div className="text-[14px] text-[#D7D7D7]">
            liq. {pos.collateralToken.liqLtv}%
          </div>
        </div>
      </div>

      <div className="col-span-1 flex justify-between items-start lg:flex-col gap-[4px] lg:gap-[8px]">
        <p className="text-[14px] text-gray-400">Price</p>
        <div className="flex flex-col items-end lg:items-start lg:gap-[4px] gap-[4px] text-[14px] lg:text-[16px]">
          <BtnGreen
            text={`Current: $${Number(pos.collateralToken.valueInUsd).toFixed(
              3
            )}`}
          />
          <BtnGreen
            text={`Liquidation: $${(
              (Number(pos.ltv) / Number(pos.collateralToken.liqLtv)) *
              Number(pos.collateralToken.valueInUsd)
            ).toFixed(3)}`}
          />
        </div>
      </div>
    </>
  );
}

function ClosedOrMaturedView({
  pos,
  yieldGenerated,
}: {
  pos: LeveragePosition;
  yieldGenerated: BigNumber;
}) {
  return (
    <>
      <div className="col-span-1 flex justify-between items-start lg:flex-col gap-[4px] lg:gap-[8px]">
        <p className="text-[14px] text-gray-400">Amount Deposited</p>
        <div className="flex lg:flex-col items-end lg:items-start lg:gap-[8px] text-[14px] lg:text-[16px]">
          <div className="text-[14px] text-[#D7D7D7]">
            {displayTokenAmount(pos.amountCollateral)}{" "}
            {pos.collateralToken.symbol}
          </div>
          ${displayTokenAmount(pos.amountDepositedInUsd)}
        </div>
      </div>

      {pos.open ? (
        <>
          <div className="col-span-1 flex justify-between items-start lg:flex-col gap-[4px] lg:gap-[8px]">
            <p className="text-[14px] text-gray-400">Yield Generated</p>
            <div className="flex lg:flex-col items-end lg:items-start lg:gap-[8px] text-[14px] lg:text-[16px]">
              {displayTokenAmount(BigNumber.max(yieldGenerated, 0))}{" "}
              {pos.collateralToken.loanToken.symbol}
              <div className="text-[14px] text-[#D7D7D7]">
                ${displayTokenAmount(BigNumber.max(yieldGenerated, 0))}
              </div>
            </div>
          </div>
        </>
      ) : pos.amountReturnedInUsd ? (
        <>
          <div className="col-span-1 flex justify-between items-start lg:flex-col gap-[4px] lg:gap-[8px]">
            <p className="text-[14px] text-gray-400">Amount Returned</p>
            <div className="flex lg:flex-col items-end lg:items-start lg:gap-[8px] text-[14px] lg:text-[16px]">
              <div className="text-[14px] text-[#D7D7D7]">
                {displayTokenAmount(pos.amountReturnedInUsd)}{" "}
                {pos.collateralToken.loanToken.symbol}
              </div>
              ${displayTokenAmount(pos.amountReturnedInUsd)}
            </div>
          </div>

          <div className="col-span-1 flex justify-between items-start lg:flex-col gap-[4px] lg:gap-[8px]">
            <p className="text-[14px] text-gray-400">Yield Generated</p>
            <div className="flex lg:flex-col items-end lg:items-start lg:gap-[8px] text-[14px] lg:text-[16px]">
              <div className="text-[14px] text-[#D7D7D7]">
                {displayTokenAmount(
                  BigNumber.max(
                    pos.amountReturnedInUsd.minus(pos.amountDepositedInUsd),
                    0
                  )
                )}{" "}
                {pos.collateralToken.loanToken.symbol}
              </div>
              $
              {displayTokenAmount(
                BigNumber.max(
                  pos.amountReturnedInUsd.minus(pos.amountDepositedInUsd),
                  0
                )
              )}
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
