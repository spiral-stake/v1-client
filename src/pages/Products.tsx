import { useState } from "react";
import Loader from "../components/low-level/Loader";
import PageTitle from "../components/low-level/PageTitle";
import ProductCard from "../components/new-components/productCard";
import RiskTab from "../components/new-components/riskTab";
import FlashLeverage from "../contract-hooks/FlashLeverage";
import { calcLeverageApy } from "../utils";
import allRisk from "../assets/icons/allRisk.svg";
import highRisk from "../assets/icons/highRisk.svg";
import mediumRisk from "../assets/icons/mediumRisk.svg";
import lowRisk from "../assets/icons/lowRisk.svg";

const Products = ({ flashLeverage }: { flashLeverage: FlashLeverage }) => {
  const [risk, setRisk] = useState<string>("all");

  return flashLeverage ? (
    <div className="flex flex-col gap-[48px] py-[48px]">
      <div className="">
        <PageTitle
          title="Maximize your stablecoin yields"
          subheading="Our system helps you leverage safely and instantly, so you earn more from the same money without extra effort."
        />
      </div>
      <div className="flex w-full gap-[48px]">
        <div className="flex flex-col gap-[16px]">
          <RiskTab
            risk="all"
            apy="25"
            icon={allRisk}
            text="A combined view of all strategies across the risk spectrum"
            setRisk={setRisk}
            currentRisk={risk}
            color="rgba(242,217,103,0.1)"
          />
          <RiskTab
            risk="high"
            apy="55"
            icon={highRisk}
            text="Involves stablecoin’s with higher volatility exposure."
            setRisk={setRisk}
            currentRisk={risk}
            color="rgba(255, 60, 60, 0.1)"
          />
          <RiskTab
            risk="medium"
            apy="35"
            icon={mediumRisk}
            text="Stablecoins backed by DeFi mechanisms like CDPs & funding rate arbitrage"
            setRisk={setRisk}
            currentRisk={risk}
            color="rgba(242, 217, 103, 0.1)"
          />
          <RiskTab
            risk="low"
            apy="12"
            icon={lowRisk}
            text="Stablecoins backed by highly credible collateral such as T-bills"
            setRisk={setRisk}
            currentRisk={risk}
            color="rgba(63, 255, 20, 0.1)"
          />
        </div>
        <div className="grid grid-cols-2 gap-x-[24px] gap-y-[34px] px-6 w-full">
          {flashLeverage.collateralTokens
            .filter((collateralToken) => {
              if (risk === "all") return true;
              return collateralToken.info.riskProfile === risk;
            })
            .sort(
              (a, b) =>
                Number(calcLeverageApy(b.impliedApy, b.borrowApy, b.safeLtv)) -
                Number(calcLeverageApy(a.impliedApy, a.borrowApy, a.safeLtv))
            )
            .map((collateralToken, index) => (
              <ProductCard
                key={index}
                icon={`/tokens/${collateralToken.symbol}.svg`}
                name={collateralToken.symbol.split("-")[1]}
                apy={calcLeverageApy(
                  collateralToken.impliedApy,
                  collateralToken.borrowApy,
                  collateralToken.safeLtv
                )}
                maturity={`${collateralToken.name.slice(
                  collateralToken.name.length - 9,
                  collateralToken.name.length - 7
                )}${" "}
                  ${collateralToken.name.slice(
                    collateralToken.name.length - 7,
                    collateralToken.name.length - 4
                  )}${", "}
                  ${collateralToken.name.slice(
                    collateralToken.name.length - 4,
                    collateralToken.name.length
                  )}`}
                underlyingCollatateralIcon={`/tokens/${collateralToken.symbol}.svg`}
                underlyingCollatateralName={
                  collateralToken.info.underlyingCollateral
                }
                yieldSource={collateralToken.info.yieldSource}
                collateralTokenAddress={collateralToken.address}
              />
            ))}
        </div>
      </div>
    </div>
  ) : (
    <div className="mt-10">
      <Loader />
    </div>
  );
};

export default Products;
