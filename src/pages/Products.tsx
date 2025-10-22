import { useState } from "react";
import Loader from "../components/low-level/Loader";
import PageTitle from "../components/low-level/PageTitle";
import ProductCard from "../components/ProductCard";
import RiskTab from "../components/RiskTab";
import FlashLeverage from "../contract-hooks/FlashLeverage";
import allRisk from "../assets/icons/allRisk.svg";
import highRisk from "../assets/icons/highRisk.svg";
import mediumRisk from "../assets/icons/mediumRisk.svg";
import lowRisk from "../assets/icons/lowRisk.svg";
import { isMatured } from "../utils";

const Products = ({ flashLeverage }: { flashLeverage: FlashLeverage }) => {
  const [risk, setRisk] = useState<string>("all");

  return flashLeverage ? (
    <div className="flex flex-col gap-[32px] lg:gap-[48px] py-[16px] lg:py-[48px]">
      <div className="">
        <PageTitle
          title="Maximize your stablecoin yields"
          subheading="Our system helps you leverage safely and instantly so you earn more from the same money without extra effort."
        />
      </div>
      <div className="flex flex-col lg:flex-row w-full gap-[48px]">
        <div className="flex gap-[8px] lg:flex-col lg:gap-[16px] overflow-x-scroll no-scrollbar">
          <RiskTab
            risk="all"
            icon={allRisk}
            text="A combined view of all strategies across the risk spectrum"
            setRisk={setRisk}
            currentRisk={risk}
            color="rgba(242,217,103,0.1)"
          />
          <RiskTab
            risk="high"
            icon={highRisk}
            text="Involves stablecoins with higher volatility exposure but the best yields possible"
            setRisk={setRisk}
            currentRisk={risk}
            color="rgba(255, 60, 60, 0.1)"
          />
          <RiskTab
            risk="medium"
            icon={mediumRisk}
            text="Stablecoins backed by DeFi mechanisms like CDPs & funding rate arbitrage"
            setRisk={setRisk}
            currentRisk={risk}
            color="rgba(242, 217, 103, 0.1)"
          />
          <RiskTab
            risk="low"
            icon={lowRisk}
            text="Stablecoins backed by highly credible collateral such as T-bills"
            setRisk={setRisk}
            currentRisk={risk}
            color="rgba(63, 255, 20, 0.1)"
          />
        </div>
        <div className="flex flex-col lg:grid grid-cols-2 gap-[16px] lg:gap-x-[24px] lg:gap-y-[34px] lg:px-6 w-full">
          {flashLeverage.collateralTokens
            .filter((collateralToken) => {
              if (risk === "all") return true;

              return collateralToken.info.riskProfile === risk;
            })
            .filter((collateralToken) => !isMatured(collateralToken))
            .sort(
              (a, b) =>
                Number(b.defaultLeverageApy) -
                Number(a.defaultLeverageApy)
            )
            .map((collateralToken, index) => (
              <ProductCard
                key={index}
                collateralToken={collateralToken}
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
