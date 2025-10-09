import axios from "axios";
import BigNumber from "bignumber.js";
import { useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { getInternalReswapData } from "../api-services/swapAggregator";
import FlashLeverage from "../contract-hooks/FlashLeverage";
import { LeveragePosition } from "../types";
import { calcLeverageApy, calcLeverage } from "../utils";
import { displayTokenAmount } from "../utils/displayTokenAmounts";
import { formatUnits } from "../utils/formatUnits";
import { getSlippage } from "../utils/getSlippage";
import { handleAsync } from "../utils/handleAsyncFunction";
import { toastSuccess } from "../utils/toastWrapper";
import ActionBtn from "./ActionBtn";
import BtnFull from "./low-level/BtnFull";
import Overlay from "./low-level/Overlay";
import BtnGreen from "./new-components/btnGreen";
import CloseReviewOverlay from "./new-components/closeReviewOverlay";

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

  const appChainId = useChainId();

  const handleCloseLeveragePosition = async () => {
    const slippage = getSlippage(Number(leveragePosition.amountCollateral));

    const { pendleSwap, tokenRedeemSy, minTokenOut, swapData, limitOrderData } =
      await getInternalReswapData(
        appChainId,
        slippage,
        flashLeverage,
        leveragePosition.collateralToken,
        leveragePosition.amountLeveragedCollateral
      );

    const amountReturnedSimulated = (
      await flashLeverage.simulate("unleverage", [
        address as string,
        leveragePosition.id,
        pendleSwap,
        tokenRedeemSy,
        minTokenOut,
        swapData,
        limitOrderData,
      ])
    ).result;

    // console.log(
    //   formatUnits(
    //     amountReturnedSimulated,
    //     leveragePosition.collateralToken.loanToken.decimals
    //   )
    //     .minus(leveragePosition.amountCollateralInLoanToken)
    //     .toString()
    // );

    const amountReturned = await flashLeverage.unleverage(
      address as string,
      leveragePosition,
      pendleSwap,
      tokenRedeemSy,
      minTokenOut,
      swapData,
      limitOrderData
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
      `Received ${displayTokenAmount(
        amountReturned as BigNumber,
        leveragePosition.collateralToken.loanToken
      )}`
    );
  };
  return (
    <div className="bg-white bg-opacity-[4%] rounded-xl w-full flex flex-col p-[24px] gap-[24px]">
      <div className="w-full flex items-center justify-between pb-[16px] lg:pb-0 lg:border-none border-b-[1px] border-white border-opacity-[6%]">
        <div className="w-full flex items-center gap-[10px]">
          <div>
            <img
              className="w-[48px]"
              src={`/tokens/${leveragePosition.collateralToken.symbolExtended}.svg`}
              alt=""
            />
          </div>
          <div>
            {" "}
            <div className="text-[24px] font-semibold">
              {`${leveragePosition.collateralToken.symbol.split("-")[1]}`}
            </div>{" "}
          </div>
          <div className="text-[#68EA6A]">
            <BtnGreen text={`${calcLeverage(leveragePosition.ltv)}x`} />
          </div>
        </div>
        <div className="hidden lg:inline-flex">
          <div>
            <BtnFull
              text="Close"
              onClick={() => {
                setShowCloseReview(true);
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[auto,auto] gap-y-[14px] grid-rows-2 lg:grid-rows-1 lg:grid-cols-[auto,auto,auto,auto,auto]">
        <div className="col-span-1 flex flex-col gap-[4px] lg:gap-[8px]">
          <div>
            <p className="text-[14px] text-gray-400">LTV</p>
          </div>
          <div className="flex items-center gap-[8px] text-[16px]">
            {leveragePosition.ltv}%<div className="text-xs lg:hidden">LTV</div>
            <div className="text-[14px] text-[#D7D7D7]">
              liq. {leveragePosition.collateralToken.liqLtv}%
            </div>
          </div>
        </div>
        <div className="col-span-1 flex flex-col gap-[4px] lg:gap-[8px]">
          <div>
            <p className="text-[14px] text-gray-400">Maturity</p>
          </div>
          <div className="flex items-center gap-[8px] text-[16px]">
            {`${leveragePosition.collateralToken.maturityDate}`}
            <div className="text-[14px] text-[#D7D7D7]">
              ({leveragePosition.collateralToken.maturityDaysLeft} Days)
            </div>
          </div>

        </div>
        <div className="col-span-1 flex flex-col gap-[4px] lg:gap-[8px]">
          <div>
            <p className="text-[14px] text-gray-400">My position</p>
          </div>
          <div className="flex items-center gap-[8px] text-[16px] truncate">
            <div>{`${displayTokenAmount(leveragePosition.amountCollateral)} 
            ${leveragePosition.collateralToken.symbol}`}</div>
            <div className="text-[14px] text-[#D7D7D7]">
              $
              {displayTokenAmount(
                leveragePosition.amountCollateral.multipliedBy(
                  leveragePosition.collateralToken.valueInUsd
                )
              )}
            </div>
          </div>
        </div>
        <div className="col-span-1 flex flex-col gap-[4px] lg:gap-[8px]">
          <div>
            <p className="text-[14px] text-gray-400">Max APY</p>
          </div>
          <div className="flex items-center gap-[8px] text-[16px]">
            {/* Needs to change, this is obsolete, need to calc for the apy and borrow apy of his positions */}
            {calcLeverageApy(
              leveragePosition.collateralToken.impliedApy,
              leveragePosition.collateralToken.borrowApy,
              leveragePosition.ltv
            )}
            %<div className="text-xs lg:hidden">Max APY</div>
            {/* <div className="text-[14px] text-[#D7D7D7]">${displayTokenAmount(leveragePosition.amountYield)}</div> */}
          </div>
        </div>

        {/* <div className="hidden col-span-1 lg:flex flex-col gap-[4px] lg:gap-[8px]">
          <div>
            <p className="text-[14px] text-gray-400">My position</p>
          </div>
          <div className="flex items-center gap-[8px] text-[16px] truncate">
            <div>{`${displayTokenAmount(leveragePosition.amountCollateral)} 
            ${leveragePosition.collateralToken.symbol}`}</div>
            <div className="text-[14px] text-[#D7D7D7]">
              $
              {displayTokenAmount(
                leveragePosition.amountCollateral.multipliedBy(
                  leveragePosition.collateralToken.valueInUsd
                )
              )}
            </div>
          </div>
        </div> */}
      </div>

      {/* mobile close button */}
      <div className="lg:hidden">
        <BtnFull
          text="Close"
          onClick={() => {
            setShowCloseReview(true);
          }}
        />
      </div>

      {showCloseReview && (
        <div>
          {/* lg close review */}
          <div className="hidden z-10 fixed top-0 left-0 bg-black bg-opacity-[70%] lg:flex flex-col gap-[24px] lg:justify-center items-end lg:items-center w-[100vw] h-[100vh]">
            <CloseReviewOverlay
              amountCollateral={Number(leveragePosition.amountCollateral)}
              collateralToken={leveragePosition.collateralToken}
              setShowCloseReview={setShowCloseReview}
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

          {/* mobile close review */}
          <div className="lg:hidden">
            <Overlay
              onClose={() => setShowCloseReview(false)}
              overlay={
                <div className="flex flex-col gap-[24px] pb-[70px] lg:pb-0 rounded-[16px] rounded-b-none bg-white bg-opacity-[10%] backdrop-blur-2xl">
                  <CloseReviewOverlay
                    amountCollateral={Number(leveragePosition.amountCollateral)}
                    collateralToken={leveragePosition.collateralToken}
                    setShowCloseReview={setShowCloseReview}
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
        </div>
      )}
    </div>
  );
};

export default LeveragePositionCard;
