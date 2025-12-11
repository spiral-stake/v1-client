import BigNumber from "bignumber.js";
import { formatNumber } from "../../utils/formatNumber";
import PoolInfoTab from "./PoolInfoTab";
import { CollateralToken, Token } from "../../types";
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
        title="Max Leverage"
        icon={maxLeverage}
        info={`< ${formatNumber(
          BigNumber.max(
            0,
            new BigNumber(collateralToken?.liquidityAssets)
              .dividedBy(BigNumber(leverage).minus(1))
              .minus(10)
          )
        )} ${collateralToken.loanToken.symbol}`}
        extraInfo={
          `$${formatNumber(
            BigNumber.max(
              0,
              new BigNumber(collateralToken?.liquidityAssets)
                .dividedBy(BigNumber(leverage).minus(1))
                .minus(10)
            ).multipliedBy(collateralToken.loanToken.valueInUsd)
          )}`
        }

      />
      <PoolInfoTab
        title="Available to Borrow"
        icon={borrow}
        info={`${formatNumber(BigNumber(collateralToken.liquidityAssets))} ${collateralToken.loanToken.symbol}`}
        extraInfo={`$${formatNumber(BigNumber(collateralToken.liquidityAssets).multipliedBy(collateralToken.loanToken.valueInUsd))}`}
      />
    </div>
  );
};

export default PoolInfo;
