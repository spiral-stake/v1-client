import { displayTokenAmount } from "../utils/displayTokenAmounts";
import { Link } from "react-router-dom";
import { LeveragePosition } from "../types";
import { calcLeverageApy, calcMaxLeverage } from "../utils";
import FlashLeverage from "../contract-hooks/FlashLeverage";
import ActionBtn from "./ActionBtn";
import { useAccount, useChainId } from "wagmi";
import { getInternalReswapData } from "../api-services/swapAggregator";
import { handleAsync } from "../utils/handleAsyncFunction";
import { useState } from "react";
import { toastSuccess } from "../utils/toastWrapper";
import BigNumber from "bignumber.js";
import axios from "axios";
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
  const [loading, setLoading] = useState<boolean>(false);

  const appChainId = useChainId();

  const handleCloseLeveragePosition = async () => {
    const { pendleSwap, tokenRedeemSy, minTokenOut, swapData, limitOrderData } =
      await getInternalReswapData(
        appChainId,
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

    console.log(
      formatUnits(
        amountReturnedSimulated,
        leveragePosition.collateralToken.loanToken.decimals
      )
        .minus(leveragePosition.amountCollateralInLoanToken)
        .toString()
    );

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
    <Link to="">
      <div className="w-full mt-4 bg-transparent hover:bg-white hover:bg-opacity-[4%] rounded-xl py-5 lg:py-2 border-y border-y-slate-800 lg:border-y-0 grid grid-cols-4 grid-rows-[1fr_1fr_2fr] lg:grid-cols-12 lg:px-5 lg:grid-rows-1 items-center lg:pr-5 transition-all ease-out duration-150">
        <div className="col-span-4 row-span-2 lg:col-span-3 lg:row-span-1 flex justify-center items-center lg:hidden">
          <div className="col-span-1 h-16 py-3 pr-5 inline-flex justify-start items-center gap-2">
            <img
              src={`/tokens/${leveragePosition.collateralToken.symbol}.svg`}
              alt=""
            />
          </div>
          <div className="col-span-2 w-full h-16 py-3 inline-flex justify-start items-center gap-4">
            <div className="inline-flex flex-col justify-center items-start">
              <div className="inline-flex justify-center items-center gap-2">
                <div className="text-lg font-semibold">
                  {`${leveragePosition.collateralToken.symbol.split("-")[1]}`}
                </div>
              </div>
            </div>
          </div>
          <div className=" lg:hidden">
            <ActionBtn
              btnLoading={loading}
              text="Close"
              onClick={handleAsync(handleCloseLeveragePosition, setLoading)}
              expectedChainId={Number(chainId)}
            />
          </div>
        </div>

        {/* symbol */}
        <div className="col-span-1 h-16 py-3 pr-5 inline-flex justify-start items-center gap-2">
          <img
            src={`/tokens/${leveragePosition.collateralToken.symbol}.svg`}
            alt=""
          />
        </div>
        {/* token */}
        <div className="col-span-2 w-full h-16 py-3 inline-flex justify-start items-center gap-4">
          <div className="inline-flex flex-col justify-center items-start">
            <div className="inline-flex justify-center items-center gap-2">
              <div className="text-lg font-semibold">
                {`${leveragePosition.collateralToken.symbol.split("-")[1]}`}
              </div>
            </div>
          </div>
        </div>

        {/* Leverage */}
        <div className="col-span-1 lg:col-span-1 h-16  flex flex-col items-start justify-center">
          {calcMaxLeverage(leveragePosition.ltv)}x
          <div className="text-xs lg:hidden">Leverage</div>
        </div>

        {/* LTV */}
        <div className="col-span-2 h-16 flex flex-col items-start justify-center">
          {leveragePosition.ltv}%<div className="text-xs lg:hidden">LTV</div>
          <div className="text-xs">liq. {leveragePosition.collateralToken.liqLtv}%</div>
        </div>

        {/* Levraged APY */}
        <div className="col-span-2 h-16 flex flex-col items-start justify-center">
          {/* Needs to change, this is obsolete, need to calc for the apy and borrow apy of his positions */}
          {calcLeverageApy(
            leveragePosition.collateralToken.impliedApy,
            leveragePosition.collateralToken.borrowApy,
            leveragePosition.ltv
          )}
          %<div className="text-xs lg:hidden">Max APY</div>
          {/* <div className="text-xs">${displayTokenAmount(leveragePosition.amountYield)}</div> */}
        </div>

        {/* My position */}
        <div className="col-span-2 h-16 flex flex-col items-start justify-center truncate">
          <div>{`${displayTokenAmount(leveragePosition.amountCollateral)} ${
            leveragePosition.collateralToken.symbol.split("-")[0]
          }-${leveragePosition.collateralToken.symbol.split("-")[1]}`}</div>
          <div className="text-xs">
            $
            {displayTokenAmount(
              leveragePosition.amountCollateral.multipliedBy(
                leveragePosition.collateralToken.valueInUsd
              )
            )}
          </div>
        </div>

        {/* action btn */}
        <div className="hidden lg:inline-flex col-span-1 justify-end">
          <div className="w-1/2 hidden lg:inline-block">
            <ActionBtn
              btnLoading={loading}
              text="Close"
              onClick={handleAsync(handleCloseLeveragePosition, setLoading)}
              expectedChainId={Number(chainId)}
            />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default LeveragePositionCard;
