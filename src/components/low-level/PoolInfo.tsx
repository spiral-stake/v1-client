import BigNumber from "bignumber.js";
import { formatNumber } from "../../utils/formatNumber";
import PoolInfoTab from "./PoolInfoTab";
import { CollateralToken } from "../../types";
import maxLeverage from "../../assets/icons/maxLeverage.svg";
import borrow from "../../assets/icons/borrow.svg";

const PoolInfo = ({
  collateralToken,
  leverage,
}: {
  collateralToken: CollateralToken;
  leverage: string;
}) => {
  return (
    <div className="w-full flex gap-[16px]">
      <PoolInfoTab
        icon={maxLeverage}
        info={`< $${formatNumber(
          BigNumber.max(
            0,
            new BigNumber(collateralToken?.liquidityAssetsUsd)
              .dividedBy(BigNumber(leverage).minus(1))
              .minus(1000)
          )
        )}`}
        title="Max Leverage"
      />
      <PoolInfoTab
        icon={borrow}
        info={`$${formatNumber(collateralToken.liquidityAssetsUsd)}`}
        title="Available to Borrow"
      />
    </div>
  );
};

export default PoolInfo;
