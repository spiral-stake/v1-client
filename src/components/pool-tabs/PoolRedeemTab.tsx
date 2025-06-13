import { useEffect, useState } from "react";
import warningIcon from "../../assets/icons/warning.svg";
import WaitTab from "../low-level/WaitTab";
import { toastSuccess } from "../../utils/toastWrapper";
import { handleAsync } from "../../utils/handleAsyncFunction";
import Pool from "../../contract-hooks/Pool";
import { Position } from "../../types";
import BigNumber from "bignumber.js";
import { displayTokenAmount } from "../../utils/displayTokenAmounts";

const PoolReedemTab = ({
  pool,
  position,
  updatePosition,
  positionsFilled,
}: {
  pool: Pool;
  position: Position | undefined;
  updatePosition: (positionId: number) => Promise<void>;
  positionsFilled: number;
}) => {
  const [amountCollateral, setAmountCollateral] = useState<BigNumber>();
  const [loading, setLoading] = useState(false);
  const [actionBtn, setActionBtn] = useState({ text: "", onClick: () => {}, disabled: false });

  useEffect(() => {
    if (!position) return;

    const updatingActionBtn = async () => {
      setAmountCollateral(position.amountCollateral);

      if (position.amountCollateral?.isGreaterThan(0)) {
        setActionBtn({
          text: `Redeem YBT Collateral`,
          disabled: false,
          onClick: handleAsync(handleRedeemCollateralIfDiscarded, setLoading),
        });
      } else {
        setActionBtn({
          ...actionBtn,
          text: `Redeemed YBT Collateral`,
          disabled: true,
        });
      }
    };

    updatingActionBtn();
  }, [position, setActionBtn]);

  const handleRedeemCollateralIfDiscarded = async () => {
    if (!position) return;

    await pool.redeemCollateralIfDiscarded(position.id);
    toastSuccess("Redeem Succesfull", "Redeemed Collateral successfully");

    await updatePosition(position.id);
  };

  return (
    <div>
      {position ? (
        <WaitTab
          icon={warningIcon}
          title="Pool Discarded!"
          msg={
            amountCollateral && amountCollateral.isGreaterThan(0)
              ? `Remaining YBT collateral - ${displayTokenAmount(amountCollateral, pool.ybt)}`
              : "You have successfully redeemed your YBT collateral"
          }
          btnText={
            amountCollateral && amountCollateral.isGreaterThan(0) ? `Redeem YBT Collateral` : ""
          }
          btnOnClick={handleRedeemCollateralIfDiscarded}
          poolChainId={pool.chainId}
        />
      ) : (
        <>
          <WaitTab
            icon={warningIcon}
            title="Pool Discarded!"
            msg={`Pool got discarded as only ${positionsFilled} of ${pool.totalPositions} positions got filled`}
          />
        </>
      )}
    </div>
  );
};

export default PoolReedemTab;
